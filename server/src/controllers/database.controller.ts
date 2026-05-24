/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { customMessage } from "../constants/customMessage";
import { AuthRequest } from "../types";
import { Response } from "express";

// download collection
const downloadFullDatabase = async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }

    const collections = await mongoose.connection.db.collections();
    const allData: Record<string, any[]> = {};

    for (const collection of collections) {
      const data = await collection.find({}).toArray();

      allData[collection.collectionName] = data;
    }

    // Force download as JSON file
    res.attachment("database-backup.json");
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(allData, null, 2));
  } catch (error) {
    console.error("Download database error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { downloadFullDatabase };
