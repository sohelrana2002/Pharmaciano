/* eslint-disable @typescript-eslint/no-explicit-any */
import { ai, forecastSchema } from "../config/gemini.config";
import { customMessage } from "../constants/customMessage";
import { isSuperAdmin } from "../middlewares/auth.middleware";
import InventoryBatch from "../models/InventoryBatch.model";
import { Medicine } from "../models/Medicine.model";
import Sale from "../models/Sale.model";
import { AuthRequest } from "../types";
import { Response } from "express";
import { redisClient } from "../config/redis.config";

const getAiForecasting = async (req: AuthRequest, res: Response) => {
  try {
    const superAdmin = isSuperAdmin(req.user);

    const {
      organizationId,
      branchId,
      fromDate,
      toDate,
      medicineName,
      barcode,
      page,
      limit,
    } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;

    const filterCriteria: any = {};
    const inventoryCriteria: any = { status: "active" };

    //   date range filter; else (3 months )
    let queryStartDate: Date;
    const queryEndDate = toDate ? new Date(toDate as string) : new Date();

    if (fromDate) {
      queryStartDate = new Date(fromDate as string);
    } else {
      queryStartDate = new Date();
      queryStartDate.setMonth(queryStartDate.getMonth() - 3);
    }

    filterCriteria.createdAt = { $gte: queryStartDate, $lte: queryEndDate };

    // Format the dates as plain strings (YYYY-MM-DD)
    const startString = queryStartDate.toISOString().split("T")[0];
    const endString = queryEndDate.toISOString().split("T")[0];

    // Generate unique cache key
    const userOrg = superAdmin
      ? organizationId || "all"
      : req.user?.organizationId;
    const userBranch = superAdmin ? branchId || "all" : req.user?.branchId;
    const searchKey = barcode
      ? `bar:${barcode}`
      : medicineName
        ? `name:${medicineName}`
        : "all";

    // create cache key
    const cacheKey = `forecast:${userOrg}:${userBranch}:${searchKey}:d:${startString}_${endString}:p:${pageNumber}:l:${limitNumber}`;

    // Check if data is cached in redis
    try {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log("Serving from redis cache(Forecast).");
        return res.status(200).json(JSON.parse(cachedData));
      }
    } catch (cacheError) {
      console.error("Redis read error(Forecast): ", cacheError);
    }

    // role wise filter
    if (!superAdmin) {
      filterCriteria.organizationId = req.user?.organizationId;
      filterCriteria.branchId = req.user?.branchId;
      inventoryCriteria.organizationId = req.user?.organizationId;
      inventoryCriteria.branchId = req.user?.branchId;
    } else {
      if (organizationId) {
        filterCriteria.organizationId = organizationId;
        inventoryCriteria.organizationId = organizationId;
      }
      if (branchId) {
        filterCriteria.branchId = branchId;
        inventoryCriteria.branchId = branchId;
      }
    }

    // Set up post-unwind sub-document match conditions
    const postUnwindMatch: any = {};

    //   barcode and medicineName filter
    if (barcode) {
      const medQuery: any = { barcode };

      if (filterCriteria.organizationId) {
        medQuery.organizationId = filterCriteria.organizationId;
      }

      const foundMedicine = await Medicine.findOne(medQuery).lean();
      // console.log("foundMedicine: ", foundMedicine);

      if (!foundMedicine) {
        return res.status(404).json({
          success: false,
          message: customMessage.notFound("Medicine"),
        });
      }
      postUnwindMatch["items.medicineId"] = foundMedicine._id;
      inventoryCriteria["medicineId"] = foundMedicine._id;
    } else if (medicineName) {
      postUnwindMatch["items.medicineName"] = {
        $regex: medicineName,
        $options: "i",
      };
      inventoryCriteria["medicineName"] = {
        $regex: medicineName,
        $options: "i",
      };
    }

    // For debugging
    // console.log("filterCriteria: ", filterCriteria);
    // console.log("inventoryCriteria: ", inventoryCriteria);

    //   aggregation (sales summery)
    const salesDataSummary = await Sale.aggregate([
      { $match: filterCriteria },
      { $unwind: "$items" },
      { $match: postUnwindMatch },
      {
        $group: {
          _id: {
            medicineId: "$items.medicineId",
            batchNo: "$items.batchNo",
          },
          medicineName: { $first: "$items.medicineName" },
          totalUnitSoldInPeriod: { $sum: "$items.quantity" },
        },
      },
      {
        $project: {
          _id: 0,
          medicineId: "$_id.medicineId",
          batchNo: "$_id.batchNo",
          medicineName: 1,
          totalUnitSoldInPeriod: 1,
        },
      },
    ]);

    if (!salesDataSummary.length) {
      return res.status(404).json({
        success: false,
        message: "No sales history found!",
      });
    }

    const inventoryBatchData = await InventoryBatch.find(inventoryCriteria)
      .select(
        "medicineId medicineName batchNo quantity expiryDate purchasePrice",
      )
      .lean();

    // For debugging
    // console.log("salesDataSummary: ", salesDataSummary);
    // console.log("inventoryBatchData: ", inventoryBatchData);

    //   AI prompt create
    const prompt = `
    You are an advanced AI Pharmacist specializing in predictive demand analytics. 
    Analyze this historical inventory baseline data and current batch statuses. 
    
    A single medicine can have multiple distinct batches (batch_no). Provide your predictions strictly batch-specific by matching medicine_id and batch_no.

    Task Objectives:
    1. Look at totalUnitsSoldInPeriod to infer historical volume performance.
    2. Provide a single cumulative prediction for the total integer units expected to be sold over the next 30 days for each unique medicine batch.
    3. Take medicine expiry_date into consideration; if a batch expires soon, evaluate if demand should drop or trigger an urgent replacement/clearance action in the reorder recommendation.

    Current External Factors:
    * Epidemiological: Flu cases rising rapidly (Higher demand expected for related categories).
    * Environmental: Temperature 27-32°C.
    * Calendar: Standard operating window, no holidays.

    Aggregated Historical Sales Data (Past 3 Months Summary):
    ${JSON.stringify(salesDataSummary, null, 2)}

    Current Inventory Batch Status:
    ${JSON.stringify(inventoryBatchData, null, 2)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "Calculate the total predicted sales as a single integer for each medicine batch for the next 30 days combined. Map 'quantity' from inventory data to 'current_stock' and 'expiryDate' to 'expiry_date' in the schema format (YYYY-MM-DD).",
        responseMimeType: "application/json",
        responseSchema: forecastSchema,
        temperature: 0.1,
      },
    });

    const result = JSON.parse(response.text || '{"forecast": []}');
    const allForecasts = result.forecast || [];

    const totalRecords = allForecasts.length;
    const startIndex = pageNumber;
    const endIndex = limitNumber;
    const paginatedForecasts = allForecasts.slice(startIndex, endIndex);

    const finalResponsePayload = {
      success: true,
      pagination: {
        totalRecords: totalRecords,
        currentPage: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalRecords / limitNumber),
      },
      meta: {
        organizationId: organizationId || "All Organizations",
        branchId: branchId || "All Branches",
        filterApplied: barcode
          ? { barcode }
          : medicineName
            ? { medicineName }
            : "None (Full Filtered Criteria)",
        analyzedFrom: queryStartDate.toISOString().split("T")[0],
        analyzedTo: queryEndDate.toISOString().split("T")[0],
      },
      data: {
        forecast: paginatedForecasts,
      },
    };

    // Save response to redis cache(1 hours)
    try {
      await redisClient.setEx(
        cacheKey,
        3600,
        JSON.stringify(finalResponsePayload),
      );
    } catch (cacheWriteError) {
      console.error("Redis write error(Forecast): ", cacheWriteError);
    }

    return res.status(200).json(finalResponsePayload);
  } catch (error) {
    console.error("AI forecasting error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { getAiForecasting };
