import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const ensureNotProduction = () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("رفض تنفيذ bootstrap-dev-admin في بيئة production");
  }
};

const run = async () => {
  ensureNotProduction();
  await connectDB();

  const email = String(process.env.DEV_ADMIN_EMAIL || "dev-admin@local.test").trim().toLowerCase();
  const password = String(process.env.DEV_ADMIN_PASSWORD || "Admin@12345");
  const name = String(process.env.DEV_ADMIN_NAME || "Dev Admin");

  if (!password || password.length < 8) {
    throw new Error("DEV_ADMIN_PASSWORD يجب أن تكون 8 أحرف على الأقل");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        role: "admin",
        isActive: true,
        password: passwordHash,
      },
      $setOnInsert: {
        permissions: ["view_all_stations", "manage_users", "manage_stations", "view_reports", "view_dashboard"],
      },
    },
    { upsert: true, new: true }
  ).select("_id name email role isActive");

  console.log("✅ Dev admin جاهز:");
  console.log(JSON.stringify({
    email,
    password,
    user,
  }, null, 2));
};

run()
  .catch((error) => {
    console.error("❌ فشل bootstrap-dev-admin:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
