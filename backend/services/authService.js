import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Station from "../models/Station.js";

const ACCOUNT_TYPES = ["individual", "company"];
const ROLES = ["admin", "accountant", "worker", "manager"];

const buildError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const normalizeAccountType = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return ACCOUNT_TYPES.includes(normalized) ? normalized : "";
};

const normalizeRole = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return ROLES.includes(normalized) ? normalized : "worker";
};

const ensureJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw buildError("خدمة تسجيل الدخول غير متاحة حاليًا", 503);
  }
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
  const name = String(payload.name || "").trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");
  const role = normalizeRole(payload.role);
  const accountType = normalizeAccountType(payload.accountType);

  if (!name || !email || !password || !accountType) {
    throw buildError("يرجى تعبئة جميع الحقول المطلوبة", 400);
  }

  if (password.length < 8) {
    throw buildError("كلمة المرور يجب أن تكون 8 أحرف على الأقل", 400);
  }

  if (accountType === "individual" && !payload.station) {
    throw buildError("يجب تحديد المحطة في حساب المحطة الفردية", 400);
  }

  return { name, email, password, role, accountType };
};

const invalidCredentialsError = () => buildError("بيانات تسجيل الدخول غير صحيحة", 401);

export const registerUser = async (payload = {}) => {
  ensureJwtSecret();
  const { name, email, password, role, accountType } = validateRegisterPayload(payload);

  const exists = await User.findOne({ email }).select("_id");
  if (exists) {
    throw buildError("يوجد مستخدم مسجل بهذا البريد الإلكتروني بالفعل", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const doc = {
    name,
    email,
    password: hashedPassword,
    role,
    accountType,
    organization: payload.organization || null,
    station: payload.station || null,
    allowedStations: Array.isArray(payload.allowedStations) ? payload.allowedStations : [],
    stationAccess: Array.isArray(payload.stationAccess) ? payload.stationAccess : [],
    permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
    isActive: payload.isActive ?? true,
  };

  if (accountType === "individual" && doc.station) {
    doc.allowedStations = [doc.station];
    doc.stationAccess = [doc.station];
    doc.currentStation = doc.station;
  }

  if (accountType === "company") {
    const stations = [...new Set([...(doc.allowedStations || []), ...(doc.stationAccess || [])].map((id) => String(id)))];
    doc.allowedStations = stations;
    doc.stationAccess = stations;
    doc.currentStation = payload.currentStation || stations[0] || null;
  }

  const user = await User.create(doc);
  return createAuthResponse(user);
};

export const loginUser = async (payload = {}) => {
  ensureJwtSecret();

  const { email, password, accountType } = validateLoginPayload(payload);
  const user = await User.findOne({ email }).select("_id name email password role permissions stationAccess allowedStations accountType station organization currentStation isActive");

  if (!user || !user.isActive) {
    throw invalidCredentialsError();
  }

  if (accountType && user.accountType !== accountType) {
    throw buildError("نوع الحساب المحدد لا يطابق بيانات المستخدم", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw invalidCredentialsError();
  }

  if (user.accountType === "individual" && user.station && !user.currentStation) {
    user.currentStation = user.station;
  }

  await user.save();

  await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
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

  const email = normalizeEmail(process.env.SEED_ADMIN_EMAIL || "admin@fuel.local");
  const password = String(process.env.SEED_ADMIN_PASSWORD || "Admin@12345");
  const name = String(process.env.SEED_ADMIN_NAME || "System Admin").trim();

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await User.create({
    name,
    email,
    password: passwordHash,
    role: "admin",
    accountType: "company",
    permissions: ["view_all_stations", "manage_users", "manage_stations", "view_reports", "view_dashboard"],
    stationAccess: [],
    allowedStations: [],
    isActive: true,
  });

  return {
    email,
    password,
    userId: admin._id,
  };
};
