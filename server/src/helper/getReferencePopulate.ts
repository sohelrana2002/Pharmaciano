/* eslint-disable @typescript-eslint/no-explicit-any */

type ReferencePopulateConfig = {
  select?: string;
  populate?: {
    path: string;
    select?: string;
  };
};

export const getReferencePopulate = (
  referenceType?: string,
): ReferencePopulateConfig => {
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
