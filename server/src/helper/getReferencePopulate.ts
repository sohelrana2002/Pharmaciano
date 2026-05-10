/* eslint-disable @typescript-eslint/no-explicit-any */
import { PopulateOptions } from "mongoose";

export const getReferencePopulate = (
  referenceType?: string,
): Partial<PopulateOptions> => {
  switch (referenceType) {
    case "Sale":
      return {
        select: "invoiceNo totalAmount customerPhone -_id",
      };

    case "Purchase":
      return {
        select: "purchaseNo totalAmount -_id",
        populate: {
          path: "supplierId",
          select: "name -_id",
        },
      };

    case "Expense":
      return {
        select: "name -_id",
      };

    default:
      return {};
  }
};
