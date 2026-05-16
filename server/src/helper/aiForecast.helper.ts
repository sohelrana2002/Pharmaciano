/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import Sale from "../models/Sale.model";
import InventoryBatch from "../models/InventoryBatch.model";

// Aggregate monthly sales – returns array of monthly totals
export const aggregateMonthlySales = async (
  branchId: Types.ObjectId,
  medicineId: Types.ObjectId,
): Promise<number[]> => {
  const today = new Date();
  // go back only 3 months max (because you have limited data)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  const sales = await Sale.find({
    branchId,
    "items.medicineId": medicineId,
    createdAt: { $gte: threeMonthsAgo },
  }).sort({ createdAt: 1 });

  const monthlyMap = new Map<string, number>();
  for (const sale of sales) {
    const date = sale.createdAt;
    const key = `${date!.getFullYear()}-${date!.getMonth() + 1}`;
    const item = sale.items.find(
      (i: any) => i.medicineId.toString() === medicineId.toString(),
    );
    if (item) {
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + item.quantity);
    }
  }
  const monthly = Array.from(monthlyMap.values());
  // if no data, return [0]
  return monthly.length ? monthly : [0];
};

// Simple demand forecast using last 2 months average + small trend
export const forecastDemandSimple = (monthlySales: number[]): number => {
  if (monthlySales.length === 0) return 0;
  if (monthlySales.length === 1) return monthlySales[0]; // repeat last month
  // use last 2 months average
  const lastTwo = monthlySales.slice(-2);
  const avg = lastTwo.reduce((a, b) => a + b, 0) / lastTwo.length;
  // if there is a trend, add half of the difference between last two months
  if (lastTwo.length === 2) {
    const diff = lastTwo[1] - lastTwo[0];
    return Math.max(0, avg + diff * 0.5);
  }
  return avg;
};

// Trend percentage based on last 2 months vs previous 2 months (if available)
export const calculateTrendPercentSimple = (monthlySales: number[]): number => {
  if (monthlySales.length < 2) return 0;
  const recent = monthlySales.slice(-2).reduce((a, b) => a + b, 0) / 2;
  const previous = monthlySales.slice(-4, -2);
  if (previous.length < 2) return 0;
  const prevAvg = previous.reduce((a, b) => a + b, 0) / 2;
  if (prevAvg === 0) return recent > 0 ? 100 : 0;
  return ((recent - prevAvg) / prevAvg) * 100;
};

// Current stock (unchanged)
export const getCurrentStock = async (
  branchId: Types.ObjectId,
  medicineId: Types.ObjectId,
): Promise<number> => {
  const batches = await InventoryBatch.find({
    branchId,
    medicineId,
    expiryDate: { $gt: new Date() },
    quantity: { $gt: 0 },
  });
  return batches.reduce((sum, batch) => sum + batch.quantity, 0);
};
