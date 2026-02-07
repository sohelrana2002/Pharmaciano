import User from "../models/User.model";
import Role from "../models/Role.model";
import Feature from "../models/Feature.model";
import { config } from "../config/config";

export const initializeSuperAdmin = async () => {
  try {
    // Create default features
    const defaultFeatures = [
      { name: "user:create", description: "Create users", category: "Users" },
      { name: "user:list", description: "User list", category: "Users" },
      { name: "user:read", description: "View profile", category: "Users" },
      { name: "user:update", description: "Update users", category: "Users" },
      { name: "user:delete", description: "Delete users", category: "Users" },
      { name: "role:create", description: "Create roles", category: "Roles" },
      { name: "role:list", description: "Role list", category: "Roles" },
      { name: "role:read", description: "View roles", category: "Roles" },
      { name: "role:update", description: "Update roles", category: "Roles" },
      { name: "role:delete", description: "Delete roles", category: "Roles" },
      {
        name: "inventory:manage",
        description: "Manage inventory",
        category: "Inventory",
      },
      {
        name: "sales:process",
        description: "Process sales",
        category: "Sales",
      },
      {
        name: "reports:view",
        description: "View reports",
        category: "Reports",
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
      { name: "Super Admin" },
      {
        name: "Super Admin",
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
        role: superAdminRole._id,
        organization: null,
        branch: null,
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
