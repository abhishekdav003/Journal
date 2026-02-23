import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import connectDB from "../config/db.js";

dotenv.config();

const resetAdminUser = async () => {
  try {
    await connectDB();

    // Delete existing admin
    const deleted = await Admin.deleteMany({});
    console.log(`Deleted ${deleted.deletedCount} admin user(s)`);

    // Create new admin
    const adminData = {
      name: "Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      isActive: true,
    };

    const admin = await Admin.create(adminData);

    console.log("\n✅ Admin user created successfully!");
    console.log("\n📧 Admin Credentials:");
    console.log("Email:", admin.email);
    console.log("Password: admin123");
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
    console.log("\n🌐 Login URL: http://localhost:3002");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting admin user:", error.message);
    process.exit(1);
  }
};

resetAdminUser();
