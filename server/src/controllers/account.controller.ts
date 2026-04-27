/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
import { AuthRequest } from "../types";
import { customMessage } from "../constants/customMessage";
import { isSuperAdmin } from "../middlewares/auth.middleware";
import Organization from "../models/Organization.model";
import { Account } from "../models/Account.model";
import { getParentAccount } from "../helper/getParentAccount";
import mongoose from "mongoose";

// create account
const createAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, code, organizationName, isActive } = req.validatedData;

    const superAdmin = isSuperAdmin(req.user);

    let organizationId = req.user!.organizationId;

    if (superAdmin) {
      // manage organizaton
      const organization = await Organization.findOne({
        name: organizationName,
        isActive: true,
      });

      if (!organization) {
        const activeOrganization = await Organization.find({
          isActive: true,
        }).select("name");

        return res.status(404).json({
          success: false,
          message: customMessage.notFound("Organization"),
          hints: `Active organization names are: ${activeOrganization.map((org) => org.name).join(", ")}`,
        });
      }
      organizationId = organization._id.toString();
    }

    //   check if account name already exist
    const accountExist = await Account.findOne({ name, organizationId });

    if (accountExist) {
      return res.status(409).json({
        success: false,
        message: customMessage.alreadyExists("Account name"),
      });
    }

    // auto parent find
    const parent = await getParentAccount(type, organizationId);

    const account = await Account.create({
      name,
      type,
      code,
      parentId: parent!._id,
      organizationId,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: customMessage.created("Account"),
      id: account._id,
    });
  } catch (error: any) {
    //MongoDB Duplicate Key Error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];

      return res.status(409).json({
        success: false,
        message: customMessage.alreadyExists(value),
        error: {
          field,
          value,
          reason: customMessage.alreadyExists(field),
        },
      });
    }

    console.error("create account error: ", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// list of account
const accountList = async (req: AuthRequest, res: Response) => {
  try {
    const { search, type, isActive, page, limit } = req.query;

    const superAdmin = isSuperAdmin(req.user);

    const filter: any = {};

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (type) filter.type = type;
    if (isActive) filter.isActive = isActive;

    // pagination
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const accounts = await Account.find(filter)
      .populate([
        {
          path: "organizationId",
          select: "name -_id",
        },
        {
          path: "parentId",
          select: "name type code -_id",
        },
      ])
      .skip(skip)
      .limit(limitNumber)
      .sort({ code: 1 });

    // counts
    const total = await Account.countDocuments({ ...filter });

    const activeCount = await Account.countDocuments({
      ...filter,
      isActive: true,
    });

    const inActiveCount = await Account.countDocuments({
      ...filter,
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      message:
        accounts.length > 0
          ? customMessage.found("List of account")
          : "No account found!",
      meta: {
        page: pageNumber,
        limit: limitNumber,
        count: accounts.length,
      },
      total,
      active: activeCount,
      inActive: inActiveCount,
      data: { accounts },
    });
  } catch (error) {
    console.error("list of account error: ", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// individual account info
const accountInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const superAdmin = isSuperAdmin(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const filter: any = { _id: id };

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
    }

    const account = await Account.findOne(filter).populate([
      {
        path: "organizationId",
        select: "name contact address -_id",
      },
      {
        path: "parentId",
        select: "name type code -_id",
      },
    ]);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Account"),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("Account"),
      data: { account },
    });
  } catch (error) {
    console.error("account info error: ", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { createAccount, accountList, accountInfo };
