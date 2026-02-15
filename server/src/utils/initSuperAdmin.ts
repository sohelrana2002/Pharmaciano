import User from "../models/User.model";
import Role from "../models/Role.model";
import Feature from "../models/Feature.model";
import { config } from "../config/config";

export const initializeSuperAdmin = async () => {
  try {
    // Create default features
    const defaultFeatures = [
      { name: "user:manage", description: "User manage", category: "Users" },
      { name: "user:read", description: "View profile", category: "Users" },
      { name: "role:manage", description: "Roles manage", category: "Roles" },
      {
        name: "inventory:manage",
        description: "Manage inventory",
        category: "Inventory",
      },
      {
        name: "sales:manage",
        description: "Manage sales",
        category: "Sales",
      },
      {
        name: "purchase:manage",
        description: "Manage purchase",
        category: "Purchase",
      },
      {
        name: "accounting:manage",
        description: "Manage accounting",
        category: "Accounting",
      },
      {
        name: "settings:manage",
        description: "Manage settings",
        category: "Settings",
      },
      {
        name: "reports:manage",
        description: "Manage reports",
        category: "Reports",
      },
      {
        name: "backup:manage",
        description: "Manage backup",
        category: "Backup",
      },
      {
        name: "audit:manage",
        description: "Manage audit",
        category: "Audit",
      },
      {
        name: "ai:manage",
        description: "Manage ai",
        category: "Ai",
      },
      {
        name: "organization:manage",
        description: "Manage organization",
        category: "Organization",
      },
      {
        name: "warehouse:manage",
        description: "Manage warehouse",
        category: "Warehouse",
      },
    ];

    for (const featureData of defaultFeatures) {
      await Feature.findOneAndUpdate({ name: featureData.name }, featureData, {
        upsert: true,
        new: true,
      });
    }

    // Create Super Admin role with all features
    const allFeatures = defaultFeatures.map((f) => f.name);
    // console.log("allFeatures", allFeatures);

    const superAdminRole = await Role.findOneAndUpdate(
      { name: "SUPER_ADMIN" },
      {
        name: "SUPER_ADMIN",
        description: "System administrator with full access",
        permissions: allFeatures,
      },
      {
        upsert: true,
        new: true,
      },
    );
    // console.log("superAdminRole", superAdminRole);

    // Create super admin user
    const superAdminEmail = config.superAdminEmail!;
    const superAdminPassword = config.superAdminPassword!;

    let superAdminUser = await User.findOne({ email: superAdminEmail }).select(
      "-password",
    );
    // console.log("superAdminUser", superAdminUser);

    if (!superAdminUser) {
      superAdminUser = new User({
        email: superAdminEmail,
        password: superAdminPassword,
        name: "Super Administrator",
        orgName: null,
        branchName: null,
        roleId: superAdminRole._id,
        organizationId: null,
        branchId: null,
        warehouseId: null,
      });
      await superAdminUser.save();

      // Update the Super Admin role if it doesn't have createdBy
      if (!superAdminRole.createdBy) {
        superAdminRole.createdBy = superAdminUser._id;
        await superAdminRole.save();
      }

      if (!superAdminUser.createdBy) {
        superAdminUser.createdBy = superAdminUser._id;
        await superAdminUser.save();
      }

      console.log("Super admin user created successfully");
    } else {
      console.log("Super admin user already exists");
    }
  } catch (error) {
    console.error("Error initializing super admin:", error);
  }
};
