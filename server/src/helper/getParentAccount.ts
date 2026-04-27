// auto parent finder

import { Account } from "../models/Account.model";

export const getParentAccount = async (
  type: string,
  organizationId: string,
) => {
  let parentName = "";

  switch (type) {
    case "asset":
      parentName = "Current Assets";
      break;
    case "liability":
      parentName = "Liabilities";
      break;
    case "income":
      parentName = "Income";
      break;
    case "expense":
      parentName = "Expense";
      break;
    case "equity":
      parentName = "Equity";
      break;
  }

  return await Account.findOne({
    name: parentName,
    organizationId,
  });
};
