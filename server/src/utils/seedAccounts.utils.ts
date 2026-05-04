import { Account } from "../models/Account.model";

const seedAccounts = async (organizationId: string) => {
  try {
    // check accounts seed already exist
    const exists = await Account.findOne({ organizationId });

    if (exists) {
      console.log("Seed accounts already exist for this organization name");
      return;
    }

    // parent account
    const assets = await Account.create({
      name: "Assets",
      type: "asset",
      code: "100",
      organizationId,
      parentId: null,
    });

    const currentAssets = await Account.create({
      name: "Current Assets",
      type: "asset",
      code: "110",
      organizationId,
      parentId: assets._id,
    });

    const liabilities = await Account.create({
      name: "Liabilities",
      type: "liability",
      code: "200",
      organizationId,
      parentId: null,
    });

    const equity = await Account.create({
      name: "Equity",
      type: "equity",
      code: "300",
      organizationId,
      parentId: null,
    });

    const income = await Account.create({
      name: "Income",
      type: "income",
      code: "400",
      organizationId,
      parentId: null,
    });

    const expense = await Account.create({
      name: "Expense",
      type: "expense",
      code: "500",
      organizationId,
      parentId: null,
    });

    // child account
    const accounts = [
      { name: "Cash", type: "asset", code: "101", parentId: currentAssets._id },
      { name: "Bank", type: "asset", code: "102", parentId: currentAssets._id },
      {
        name: "Bkash",
        type: "asset",
        code: "103",
        parentId: currentAssets._id,
      },
      {
        name: "Nagad",
        type: "asset",
        code: "104",
        parentId: currentAssets._id,
      },
      {
        name: "Rocket",
        type: "asset",
        code: "105",
        parentId: currentAssets._id,
      },
      {
        name: "Inventory",
        type: "asset",
        code: "106",
        parentId: currentAssets._id,
      },
      {
        name: "Account Receivable",
        type: "asset",
        code: "107",
        parentId: currentAssets._id,
      },

      {
        name: "Account Payable",
        type: "liability",
        code: "201",
        parentId: liabilities._id,
      },

      {
        name: "Owner Capital",
        type: "equity",
        code: "301",
        parentId: equity._id,
      },
      {
        name: "Owner Drawings",
        type: "equity",
        code: "302",
        parentId: equity._id,
      },

      {
        name: "Sales Revenue",
        type: "income",
        code: "401",
        parentId: income._id,
      },

      {
        name: "Purchase Expense",
        type: "expense",
        code: "501",
        parentId: expense._id,
      },
      {
        name: "Discount Given",
        type: "expense",
        code: "502",
        parentId: expense._id,
      },
      {
        name: "Salary Expense",
        type: "expense",
        code: "503",
        parentId: expense._id,
      },
      {
        name: "Rent Expense",
        type: "expense",
        code: "504",
        parentId: expense._id,
      },
    ];

    await Account.insertMany(
      accounts.map(
        (acc) => ({
          ...acc,
          organizationId,
        }),
        { ordered: true },
      ),
    );

    console.log("Default accounts seeded successfully");
  } catch (error) {
    console.log("default seed accounts error: ", error);
  }
};

export default seedAccounts;
