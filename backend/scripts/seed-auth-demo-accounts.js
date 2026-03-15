import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Station from "../models/Station.js";
import Organization from "../models/Organization.js";

const buildCode = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const ensureStation = async (name) => {
  const existing = await Station.findOne({ name, isDeleted: false }).select("_id");
  if (existing) return existing._id;

  const station = await Station.create({
    name,
    code: buildCode("STN"),
    status: "active",
    isDeleted: false,
  });

  return station._id;
};

const ensureOrganization = async (name) => {
  const existing = await Organization.findOne({ name, isDeleted: false }).select("_id");
  if (existing) return existing._id;

  const organization = await Organization.create({
    name,
    code: buildCode("ORG"),
    isActive: true,
    isDeleted: false,
  });

  return organization._id;
};

const upsertDemoUser = async ({ name, email, password, role, accountType, stationName, organizationName }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  const stationId = accountType === "individual" ? await ensureStation(stationName) : null;
  const organizationId = accountType === "company" ? await ensureOrganization(organizationName) : null;

  const update = {
    name,
    email: normalizedEmail,
    password: passwordHash,
    role,
    accountType,
    station: stationId,
    organization: organizationId,
    allowedStations: stationId ? [stationId] : [],
    stationAccess: stationId ? [stationId] : [],
    currentStation: stationId,
    isActive: true,
  };

  const user = await User.findOneAndUpdate(
    { email: normalizedEmail },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).select("_id name email role accountType station organization");

  return user;
};

const run = async () => {
  await connectDB();

  const accounts = [
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

  const created = [];
  for (const account of accounts) {
    const user = await upsertDemoUser(account);
    created.push({
      ...account,
      userId: user._id,
    });
  }

  console.log("✅ Demo auth accounts are ready:");
  console.log(JSON.stringify(created, null, 2));
};

run()
  .catch((error) => {
    console.error("❌ Failed to seed demo auth accounts:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
