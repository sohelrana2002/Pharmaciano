/* eslint-disable @typescript-eslint/no-explicit-any */
import { customMessage } from "../constants/customMessage";
import { isSuperAdmin } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types";
import { Response } from "express";
import { Medicine } from "../models/Medicine.model";
import Sale from "../models/Sale.model";

const getSalesReport = async (req: AuthRequest, res: Response) => {
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

    let queryStartDate: Date;
    const queryEndDate = toDate ? new Date(toDate as string) : new Date();

    if (fromDate) {
      queryStartDate = new Date(fromDate as string);
    } else {
      queryStartDate = new Date();
      queryStartDate.setMonth(queryStartDate.getMonth() - 3);
    }

    filterCriteria.createdAt = { $gte: queryStartDate, $lte: queryEndDate };

    //   role wise filter
    if (!superAdmin) {
      filterCriteria.organizationId = req.user?.organizationId;
      filterCriteria.branchId = req.user?.branchId;
    } else {
      if (organizationId) {
        filterCriteria.organizationId = organizationId;
      }
      if (branchId) {
        filterCriteria.branchId = branchId;
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

      if (!foundMedicine) {
        return res.status(404).json({
          success: false,
          message: customMessage.notFound("Medicine"),
        });
      }

      postUnwindMatch["items.medicineId"] = foundMedicine._id;
    } else if (medicineName) {
      postUnwindMatch["items.medicineName"] = {
        $regex: medicineName,
        $options: "i",
      };
    }

    //   aggregation (sales summary)
    const summaryResult = await Sale.aggregate([
      { $match: filterCriteria },
      { $unwind: "$items" },
      { $match: postUnwindMatch },

      {
        $addFields: {
          lineRevenue: {
            $multiply: ["$items.quantity", "$items.sellingPrice"],
          },
          lineCost: {
            $multiply: ["$items.quantity", "$items.purchasePrice"],
          },
        },
      },
      {
        $group: {
          _id: {
            medicineId: "$items.medicineId",
            batchNo: "$items.batchNo",
          },
          medicineName: { $first: "$items.medicineName" },
          saleRevenue: { $sum: "$lineRevenue" },
          saleCost: { $sum: "$lineCost" },
          saleDiscount: { $first: "$discount" },
          saleTax: { $first: "$tax" },
          itemCount: { $sum: "$items.quantity" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$saleRevenue" },
          totalCost: { $sum: "$saleCost" },
          totalDiscount: { $sum: "$saleDiscount" },
          totalTax: { $sum: "$saleTax" },
          totalItemsSold: { $sum: "$itemCount" },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    const summary =
      summaryResult.length > 0
        ? summaryResult[0]
        : {
            totalRevenue: 0,
            totalCost: 0,
            totalDiscount: 0,
            totalTax: 0,
            totalItemsSold: 0,
            transactionCount: 0,
          };

    const grossProfit = summary.totalRevenue - summary.totalCost;
    const averageOrderValue =
      summary.transactionCount > 0
        ? summary.totalRevenue / summary.transactionCount
        : 0;

    const topProducts = await Sale.aggregate([
      { $match: filterCriteria },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            medicineId: "$items.medicineId",
            batchNo: "$items.batchNo",
          },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.sellingPrice"] },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);

    const topSellingByQuantity = await Sale.aggregate([
      { $match: filterCriteria },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            medicineId: "$items.medicineId",
            batchNo: "$items.batchNo",
          },
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    const lowMarginProducts = await Sale.aggregate([
      { $match: filterCriteria },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            medicineId: "$items.medicineId",
            batchNo: "$items.batchNo",
          },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.sellingPrice"] },
          },
          totalCost: {
            $sum: { $multiply: ["$items.quantity", "$items.purchasePrice"] },
          },
        },
      },
      {
        $addFields: {
          marginPercent: {
            $cond: [
              { $eq: ["$totalRevenue", 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ["$totalRevenue", "$totalCost"] },
                      "$totalRevenue",
                    ],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
      { $sort: { marginPercent: 1 } },
      { $limit: 5 },
    ]);

    const salesTrend = await Sale.aggregate([
      { $match: filterCriteria },
      { $unwind: "$items" },
      { $match: postUnwindMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 }, // প্রতি দিনে ফিল্টারকৃত সেলের সংখ্যা
          revenue: {
            $sum: { $multiply: ["$items.quantity", "$items.sellingPrice"] },
          }, // ফিল্টারকৃত আইটেমের আয়
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const paymentBreakdown = await Sale.aggregate([
      { $match: filterCriteria },
      { $unwind: "$items" },
      { $match: postUnwindMatch },
      {
        $group: {
          _id: {
            medicineId: "$items.medicineId",
            batchNo: "$items.batchNo",
          },
          paymentType: { $first: "$paymentMethod.type" },
          totalAmount: { $first: "$totalAmount" },
        },
      },
      {
        $group: {
          _id: "$paymentType",
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue: summary.totalRevenue,
          totalCost: summary.totalCost,
          grossProfit,
          totalItemsSold: summary.totalItemsSold,
          averageOrderValue,
          totalDiscount: summary.totalDiscount,
          totalTax: summary.totalTax,
          transactionCount: summary.transactionCount,
        },
        topProducts,
        topSellingByQuantity,
        lowMarginProducts,
        salesTrend,
        paymentBreakdown,
      },
    });
  } catch (error) {
    console.error("Get sales report error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { getSalesReport };
