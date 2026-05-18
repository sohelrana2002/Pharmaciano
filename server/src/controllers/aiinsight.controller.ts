/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { Types } from "mongoose";
import Sale from "../models/Sale.model";
import { AIInsight } from "../models/AIInsight.model";

import {
  aggregateMonthlySales,
  forecastDemandSimple,
  getCurrentStock,
} from "../helper/aiForecast.helper";
import { customMessage } from "../constants/customMessage";

// ---------- Internal Demand Generator (No AI, uses simple math) ----------
async function generateDemandInsightInternal(
  organizationId: Types.ObjectId,
  branchId: Types.ObjectId,
  medicineId: Types.ObjectId,
) {
  const startTime = Date.now();
  try {
    const monthlySales = await aggregateMonthlySales(branchId, medicineId);
    console.log("monthlySales: ", monthlySales);

    if (monthlySales.length === 0) return null; // no sales data

    const predictedValue = forecastDemandSimple(monthlySales);
    console.log("predictedValue: ", predictedValue);

    // const confidence = 0.7; // lower confidence because we have limited data
    const currentStock = await getCurrentStock(branchId, medicineId);
    console.log("currentStock: ", currentStock);

    const stockRatio = currentStock / predictedValue;
    console.log("stockRatio: ", stockRatio);

    const urgencyLevel =
      stockRatio < 0.5
        ? "Critical"
        : stockRatio < 1
          ? "High"
          : stockRatio > 3
            ? "Medium"
            : "Low";

    const riskLevel =
      stockRatio < 1 ? "Stockout" : stockRatio > 3 ? "Overstock" : "Optimal";

    const recommendation = `Predicted demand for next month: ${Math.round(predictedValue)} units. Current stock: ${currentStock}. ${
      riskLevel === "Stockout"
        ? "Please reorder soon."
        : riskLevel === "Overstock"
          ? "Avoid overstocking."
          : "Stock level optimal."
    }`;

    const validFrom = new Date();
    const validTo = new Date();
    validTo.setMonth(validTo.getMonth() + 1);

    // ----- DUPLICATE PREVENTION -----
    // Check if an insight already exists for this medicine/branch/type from today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const existingInsight = await AIInsight.findOne({
      organizationId,
      branchId,
      medicineId,
      insightType: "demand",
      generatedAt: { $gte: todayStart },
    });

    if (existingInsight) {
      // Update existing insight instead of creating a new one
      existingInsight.predictedValue = predictedValue;
      existingInsight.confidence = 0.7;
      existingInsight.recommendation = recommendation;
      existingInsight.urgencyLevel = urgencyLevel;
      existingInsight.riskLevel = riskLevel;
      existingInsight.validFrom = validFrom;
      existingInsight.validTo = validTo;
      existingInsight.processingTimeMs = Date.now() - startTime;
      existingInsight.modelName = "SimpleProjection";
      await existingInsight.save();
      return existingInsight;
    }

    // Otherwise create a new one
    const insight = new AIInsight({
      _id: new Types.ObjectId(),
      organizationId,
      branchId,
      medicineId,
      insightType: "demand",
      predictedValue,
      confidence: 0.7,
      recommendation,
      generatedAt: new Date(),
      validFrom,
      validTo,
      urgencyLevel,
      riskLevel,
      modelVersion: "1.0.0",
      modelName: "SimpleProjection",
      status: "pending",
      processingTimeMs: Date.now() - startTime,
    });
    await insight.save();

    return insight;
  } catch (err) {
    console.error(`Demand insight failed for ${medicineId}:`, err);
    return null;
  }
}

// ---------- Auto: Top Demand Medicines (based on recent total sales) ----------
export const autoDemandInsights = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const organizationId = req.query.organizationId as string;
    const branchId = req.query.branchId as string;
    if (!organizationId)
      return res.status(400).json({ error: "organizationId required" });

    const orgId = new Types.ObjectId(organizationId);
    const brId = branchId ? new Types.ObjectId(branchId) : null;

    // Get all medicines with sales in the last 2 months
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const matchStage: any = { createdAt: { $gte: twoMonthsAgo } };
    if (brId) matchStage.branchId = brId;
    matchStage.organizationId = orgId;

    const medicineStats = await Sale.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: { medicineId: "$items.medicineId", branchId: "$branchId" },
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);

    const insights = [];
    for (const stat of medicineStats) {
      const medId = stat._id.medicineId;
      const branchIdDoc = stat._id.branchId;
      const insight = await generateDemandInsightInternal(
        orgId,
        branchIdDoc,
        medId,
      );
      if (insight) insights.push(insight);
    }

    // Fetch the saved insights with populated medicineId and branchId
    const populatedInsights = await AIInsight.find({ _id: { $in: insights } })
      .populate("medicineId") // gives full medicine document
      .sort({ generatedAt: -1 });

    res.status(200).json({
      success: true,
      message: customMessage.found("Auto Demand"),
      meta: {
        count: populatedInsights.length,
      },
      data: {
        populatedInsights,
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
