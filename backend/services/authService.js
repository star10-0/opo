import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Station from "../models/Station.js";
import Organization from "../models/Organization.js";

const ACCOUNT_TYPES = ["individual", "company"];
const ROLES = ["admin", "accountant", "worker", "manager"];
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const buildError = (message, statusCode = 400, details = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) {
    error.details = details;
  }
  return error;
};

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const normalizeAccountType = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return ACCOUNT_TYPES.includes(normalized) ? normalized : "";
};

const normalizeRole = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return ROLES.includes(normalized) ? normalized : "admin";
};

const ensureJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw buildError("خدمة تسجيل الدخول غير متاحة حاليًا", 503);
  }
};

const logAuthDebug = (scope, payload = {}) => {
  if (process.env.NODE_ENV === "production") return;
  console.warn(`[AUTH:${scope}]`, payload);
};

const buildUniqueCode = async (Model, prefix, session) => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const exists = await Model.findOne({ code: candidate }).session(session).select("_id");
    if (!exists) return candidate;
  }

  throw buildError("تعذر إنشاء رمز فريد للحساب، يرجى المحاولة مرة أخرى", 500);
};

const serializeStation = (station) => {
  if (!station) return null;
  return {
    _id: station._id,
    name: station.name,
    code: station.code,
    status: station.status,
  };
};

const resolveStations = async (user) => {
  const stationIds = user.accountType === "individual"
    ? [user.station].filter(Boolean)
    : (user.allowedStations || user.stationAccess || []).filter(Boolean);

  const uniqueStationIds = [...new Set(stationIds.map((id) => String(id)))];
  if (!uniqueStationIds.length) {
    return { selectedStation: null, availableStations: [] };
  }

  const stations = await Station.find({
    _id: { $in: uniqueStationIds },
    isDeleted: false,
  })
    .select("_id name code status")
    .sort({ name: 1 });

  const selectedStationId = String(user.currentStation || user.station || stations[0]?._id || "");
  const selectedStation = stations.find((station) => String(station._id) === selectedStationId) || stations[0] || null;

  return {
    selectedStation: serializeStation(selectedStation),
    availableStations: stations.map(serializeStation),
  };
};

const buildAuthUserPayload = (user, stationsData) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  permissions: user.permissions || [],
  stationAccess: user.stationAccess || [],
  accountType: user.accountType,
  station: user.station || null,
  organization: user.organization || null,
  allowedStations: user.allowedStations || [],
  currentStation: stationsData.selectedStation?._id || null,
});

const createAuthResponse = async (user) => {
  const stationsData = await resolveStations(user);

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      accountType: user.accountType,
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN || "12h",
    }
  );

  return {
    token,
    user: buildAuthUserPayload(user, stationsData),
    accountType: user.accountType,
    selectedStation: stationsData.selectedStation,
    availableStations: stationsData.availableStations,
  };
};

const validateLoginPayload = (payload = {}) => {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");
  const accountType = normalizeAccountType(payload.accountType);

  if (!email || !password) {
    throw buildError("يرجى إدخال البريد الإلكتروني وكلمة المرور", 400);
  }

  return { email, password, accountType };
};

const validateRegisterPayload = (payload = {}) => {
  const fieldErrors = {};

  const name = String(payload.name || "").trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");
  const confirmPassword = String(payload.confirmPassword || "");
  const role = normalizeRole(payload.role);
  const accountType = normalizeAccountType(payload.accountType);
  const stationName = String(payload.stationName || "").trim();
  const organizationName = String(payload.organizationName || "").trim();

  if (!name) {
    fieldErrors.name = "الاسم مطلوب";
  } else if (name.length < 3) {
    fieldErrors.name = "الاسم يجب أن يكون 3 أحرف على الأقل";
  }

  if (!email) {
    fieldErrors.email = "البريد الإلكتروني مطلوب";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    fieldErrors.email = "يرجى إدخال بريد إلكتروني صحيح";
  }

  if (!password) {
    fieldErrors.password = "كلمة المرور مطلوبة";
  } else if (!PASSWORD_REGEX.test(password)) {
    fieldErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي حرفًا كبيرًا ورقمًا";
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
  } else if (confirmPassword !== password) {
    fieldErrors.confirmPassword = "تأكيد كلمة المرور غير مطابق";
  }

  if (!accountType) {
    fieldErrors.accountType = "نوع الحساب يجب أن يكون محطة فردية أو مؤسسة";
  }

  if (accountType === "individual" && !stationName) {
    fieldErrors.stationName = "اسم المحطة مطلوب للحساب الفردي";
  }

  if (accountType === "company" && !organizationName) {
    fieldErrors.organizationName = "اسم المؤسسة مطلوب لحساب المؤسسة";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw buildError("يرجى تصحيح بيانات التسجيل", 400, fieldErrors);
  }

  return {
    name,
    email,
    password,
    role,
    accountType,
    stationName,
    organizationName,
  };
};

const invalidCredentialsError = () => buildError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);

export const registerUser = async (payload = {}) => {
  ensureJwtSecret();
  const { name, email, password, role, accountType, stationName, organizationName } = validateRegisterPayload(payload);

  const existingUser = await User.findOne({ email }).select("_id");
  if (existingUser) {
    logAuthDebug("register_failed_existing_email", { email });
    throw buildError("هذا البريد مستخدم بالفعل", 409, { email: "هذا البريد مستخدم بالفعل" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    let organizationId = null;
    let stationId = null;

    if (accountType === "company") {
      const organization = await Organization.create([
        {
          name: organizationName,
          code: await buildUniqueCode(Organization, "ORG", session),
          isActive: true,
          isDeleted: false,
        },
      ], { session });
      organizationId = organization[0]._id;
    }

    if (accountType === "individual") {
      const station = await Station.create([
        {
          name: stationName,
          code: await buildUniqueCode(Station, "STN", session),
          status: "active",
          isDeleted: false,
        },
      ], { session });
      stationId = station[0]._id;
    }

    const userRole = role || "admin";
    const userDoc = {
      name,
      email,
      password: hashedPassword,
      role: userRole,
      accountType,
      organization: organizationId,
      station: stationId,
      allowedStations: stationId ? [stationId] : [],
      stationAccess: stationId ? [stationId] : [],
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
      isActive: payload.isActive ?? true,
      currentStation: stationId,
    };

    const createdUsers = await User.create([userDoc], { session });

    await session.commitTransaction();
    const user = createdUsers[0];
    return createAuthResponse(user);
  } catch (error) {
    await session.abortTransaction();

    if (error?.code === 11000 && error?.keyPattern?.email) {
      logAuthDebug("register_failed_duplicate_index", { email });
      throw buildError("هذا البريد مستخدم بالفعل", 409, { email: "هذا البريد مستخدم بالفعل" });
    }

    if (error.statusCode) {
      logAuthDebug("register_failed_validation", {
        email,
        statusCode: error.statusCode,
        message: error.message,
      });
      throw error;
    }

    logAuthDebug("register_failed_unexpected", { email, message: error.message });
    throw buildError("تعذر إنشاء الحساب حاليًا، يرجى المحاولة مرة أخرى", 500);
  } finally {
    session.endSession();
  }
};

export const loginUser = async (payload = {}) => {
  ensureJwtSecret();

  const { email, password, accountType } = validateLoginPayload(payload);
  const user = await User.findOne({ email }).select("_id name email password role permissions stationAccess allowedStations accountType station organization currentStation isActive");

  if (!user || !user.isActive) {
    logAuthDebug("login_failed_user_not_found_or_inactive", { email });
    throw invalidCredentialsError();
  }

  if (accountType && user.accountType !== accountType) {
    logAuthDebug("login_failed_account_type_mismatch", { email, expected: user.accountType, received: accountType });
    throw invalidCredentialsError();
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logAuthDebug("login_failed_password_mismatch", { email });
    throw invalidCredentialsError();
  }

  if (user.accountType === "individual" && user.station && !user.currentStation) {
    user.currentStation = user.station;
  }

  await user.save();

  await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
  logAuthDebug("login_success", { userId: String(user._id), email: user.email, accountType: user.accountType });
  return createAuthResponse(user);
};

export const getCurrentUser = async (userId) => {
  ensureJwtSecret();

  const user = await User.findById(userId).select("_id name email role permissions stationAccess allowedStations accountType station organization currentStation isActive");
  if (!user || !user.isActive) {
    throw buildError("الجلسة غير صالحة، يرجى تسجيل الدخول مجددًا", 401);
  }

  return createAuthResponse(user);
};

export const selectCurrentStation = async (userId, stationId) => {
  ensureJwtSecret();

  if (!stationId) {
    throw buildError("يرجى اختيار محطة صالحة", 400);
  }

  const user = await User.findById(userId).select("_id name email role permissions stationAccess allowedStations accountType station organization currentStation isActive");
  if (!user || !user.isActive) {
    throw buildError("الجلسة غير صالحة، يرجى تسجيل الدخول مجددًا", 401);
  }

  const allowed = user.accountType === "individual"
    ? [String(user.station || "")]
    : [...new Set([...(user.allowedStations || []), ...(user.stationAccess || [])].map((id) => String(id)))];

  if (!allowed.includes(String(stationId))) {
    throw buildError("لا تملك صلاحية الوصول إلى هذه المحطة", 403);
  }

  user.currentStation = stationId;
  await user.save();

  return createAuthResponse(user);
};

export const ensureInitialAdminIfEmpty = async () => {
  const usersCount = await User.countDocuments({});
  if (usersCount > 0) return null;

  const defaultSeeds = [
    {
      name: "مدير المحطة",
      email: normalizeEmail(process.env.SEED_STATION_ADMIN_EMAIL || "admin@station.local"),
      password: String(process.env.SEED_STATION_ADMIN_PASSWORD || "Admin@12345"),
      accountType: "individual",
      stationName: String(process.env.SEED_STATION_NAME || "محطة النور"),
      role: "admin",
    },
    {
      name: "مدير المؤسسة",
      email: normalizeEmail(process.env.SEED_COMPANY_ADMIN_EMAIL || "owner@company.local"),
      password: String(process.env.SEED_COMPANY_ADMIN_PASSWORD || "Company@12345"),
      accountType: "company",
      organizationName: String(process.env.SEED_ORGANIZATION_NAME || "مؤسسة الوقود المتحدة"),
      role: "admin",
    },
  ];

  const seeded = [];

  for (const seed of defaultSeeds) {
    const result = await registerUser({
      ...seed,
      confirmPassword: seed.password,
      isActive: true,
      permissions: ["view_all_stations", "manage_users", "manage_stations", "view_reports", "view_dashboard"],
    });

    seeded.push({
      email: seed.email,
      password: seed.password,
      accountType: seed.accountType,
      selectedStation: result.selectedStation,
      userId: result.user?._id,
    });
  }

  return seeded;
};
