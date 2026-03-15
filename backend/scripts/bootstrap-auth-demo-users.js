import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { registerUser } from "../services/authService.js";

const ensureNotProduction = () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("رفض تنفيذ bootstrap-auth-demo-users في بيئة production");
  }
};

const users = [
  {
    name: "مدير المحطة",
    email: "admin@station.local",
    password: "Admin@12345",
    accountType: "individual",
    stationName: "محطة النور",
    role: "admin",
  },
  {
    name: "مدير المؤسسة",
    email: "owner@company.local",
    password: "Company@12345",
    accountType: "company",
    organizationName: "مؤسسة الوقود المتحدة",
    role: "admin",
  },
];

const run = async () => {
  ensureNotProduction();

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET مطلوب لتوليد التوكن أثناء إنشاء الحسابات التجريبية");
  }

  await connectDB();

  const result = [];
  for (const user of users) {
    try {
      const payload = await registerUser({ ...user, confirmPassword: user.password });
      result.push({ email: user.email, status: "created", userId: payload.user?._id, accountType: user.accountType });
    } catch (error) {
      if (error?.statusCode === 409) {
        result.push({ email: user.email, status: "already-exists", accountType: user.accountType });
        continue;
      }
      throw error;
    }
  }

  console.log("✅ Auth demo users bootstrap finished");
  console.log(JSON.stringify(result, null, 2));
};

run()
  .catch((error) => {
    console.error("❌ bootstrap-auth-demo-users failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
