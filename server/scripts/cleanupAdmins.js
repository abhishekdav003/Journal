import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import connectDB from "../config/db.js";

dotenv.config();

const cleanupAdminUsers = async () => {
  try {
    await connectDB();

    console.log("🧹 Cleaning up admin users from User collection...");

    // Delete all users with admin role
    const result = await User.deleteMany({ role: "admin" });
    console.log(
      `✅ Deleted ${result.deletedCount} admin user(s) from User collection`,
    );

    // Check if Admin collection has any admins
    const adminCount = await Admin.countDocuments();
    console.log(`📊 Admin collection has ${adminCount} admin(s)`);

    if (adminCount === 0) {
      console.log("\n⚠️  No admin found in Admin collection.");
      console.log("Run 'npm run create-admin' to create a new admin user.");
    } else {
      console.log("\n✅ Cleanup complete!");
      console.log("Admin users are now in the separate Admin collection.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
    process.exit(1);
  }
};

cleanupAdminUsers();
