import { Schema, model } from "mongoose";
import { IAIInsight } from "../types";

const AIInsightSchema = new Schema<IAIInsight>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    medicineId: {
      type: Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    insightType: {
      type: String,
      enum: ["demand", "trend", "stock"],
      required: true,
    },
    predictedValue: {
      type: Number,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    recommendation: {
      type: String,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },

    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    urgencyLevel: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["Stockout", "Overstock", "Expiry", "Optimal"],
      required: true,
    },
    expiryImpact: { type: Number },
    actualValue: { type: Number },
    forecastError: { type: Number },
    modelVersion: { type: String, required: true, default: "1.0.0" },
    modelName: { type: String, required: true, default: "GenevaForecast" },
    status: {
      type: String,
      enum: ["pending", "reviewed", "actioned", "expired", "failed"],
      default: "pending",
    },
    processingTimeMs: { type: Number, required: true },
  },
  { timestamps: true },
);

export const AIInsight = model<IAIInsight>("AIInsight", AIInsightSchema);
