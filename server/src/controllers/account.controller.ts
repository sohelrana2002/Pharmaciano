/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
import { AuthRequest } from "../types";
import { customMessage } from "../constants/customMessage";
import { isSuperAdmin } from "../middlewares/auth.middleware";
import Organization from "../models/Organization.model";
import { Account } from "../models/Account.model";
import { getParentAccount } from "../helper/getParentAccount";

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

    res.status(201).json({
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

export { createAccount };
