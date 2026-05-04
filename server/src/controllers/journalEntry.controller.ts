/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRequest } from "../types";
import { Response } from "express";
import mongoose from "mongoose";
import { customMessage } from "../constants/customMessage";
import { isSuperAdmin } from "../middlewares/auth.middleware";
import Organization from "../models/Organization.model";
import Branch from "../models/Branch.model";
import { Account } from "../models/Account.model";
import { JournalEntry } from "../models/JournalEntry.model";

// create journalEntry
const createJournalEntry = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const superAdmin = isSuperAdmin(req.user);

    const {
      debitAccountId,
      creditAccountId,
      amount,
      referenceType,
      referenceId,
      note,
      organizationName,
      branchName,
    } = req.validatedData;

    let organizationId;
    let branchId;

    if (superAdmin) {
      // manage organizaton
      const organization = await Organization.findOne({
        name: organizationName,
        isActive: true,
      }).session(session);

      if (!organization) {
        const activeOrganization = await Organization.find({
          isActive: true,
        })
          .select("name")
          .session(session);

        await session.abortTransaction();
        session.endSession();

        return res.status(404).json({
          success: false,
          message: customMessage.notFound("Organization"),
          hints: `Active organization names are: ${activeOrganization.map((org) => org.name).join(", ")}`,
        });
      }
      organizationId = organization._id.toString();

      // manage branch
      if (branchName) {
        const branch = await Branch.findOne({
          name: branchName,
          organizationId,
          isActive: true,
        }).session(session);

        if (!branch) {
          const activeBranch = await Branch.find({
            organizationId,
            isActive: true,
          })
            .select("name")
            .session(session);

          await session.abortTransaction();
          session.endSession();

          return res.status(404).json({
            success: false,
            message: customMessage.notFound("Branch"),
            hints: `Active branch names are: ${activeBranch.map((bra) => bra.name).join(", ")}`,
          });
        }
        branchId = branch._id.toString();
      }
    }

    if (debitAccountId === creditAccountId) {
      return res.status(400).json({
        success: false,
        message: "Debit and Credit cannot be same account.",
      });
    }

    const debitAccount = await Account.findById(debitAccountId);
    const creditAccout = await Account.findById(creditAccountId);

    if (!debitAccount || !creditAccout) {
      return res.status(400).json({
        success: false,
        message: "Invalid accounts selected",
      });
    }

    const journal = await JournalEntry.create({
      organizationId,
      branchId,
      debitAccountId,
      creditAccountId,
      amount,
      referenceType,
      referenceId: referenceId ?? null,
      note,
    });

    await journal.save({ session });

    // commit
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: customMessage.created("Journal"),
      id: journal!._id,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

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
    console.error("create journalEntry error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { createJournalEntry };
