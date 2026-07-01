import { GoogleGenAI, Type } from "@google/genai";
import { config } from "./config";

export const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

export const forecastSchema = {
  type: Type.OBJECT,
  properties: {
    forecast: {
      type: Type.ARRAY,
      description:
        "Summary of medicine demand forecasting based on full historical aggregated summary data.",
      items: {
        type: Type.OBJECT,
        properties: {
          medicine_id: { type: Type.STRING },
          medicine_name: { type: Type.STRING },
          batch_no: { type: Type.STRING },
          current_stock: { type: Type.INTEGER },
          expiry_date: {
            type: Type.STRING,
            description: "Expiry date of this specific batch (YYYY-MM-DD).",
          },
          predicted_total_sales_next_30_days: { type: Type.INTEGER },
          confidence_interval: { type: Type.STRING },
          demand_status: { type: Type.STRING },
          reorder_recommendation: { type: Type.STRING },
        },
        required: [
          "medicine_id",
          "medicine_name",
          "batch_no",
          "current_stock",
          "expiry_date",
          "predicted_total_sales_next_30_days",
          "confidence_interval",
          "demand_status",
          "reorder_recommendation",
        ],
      },
    },
  },
  required: ["forecast"],
};
