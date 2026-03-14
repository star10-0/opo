import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const invalidCredentialsError = () => {
  const error = new Error("بيانات تسجيل الدخول غير صحيحة");
  error.statusCode = 401;
  return error;
};

const validateLoginPayload = (payload = {}) => {
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");

  if (!email || !password) {
    const error = new Error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
    error.statusCode = 400;
    throw error;
  }

  return { email, password };
};

const buildAuthUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  permissions: user.permissions || [],
  stationAccess: user.stationAccess || [],
});

export const loginUser = async (payload = {}) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("Authentication service unavailable");
    error.statusCode = 503;
    throw error;
  }

  const { email, password } = validateLoginPayload(payload);
  const user = await User.findOne({ email }).select("_id name email password role permissions stationAccess isActive");

  if (!user || !user.isActive) {
    throw invalidCredentialsError();
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw invalidCredentialsError();
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRES_IN || "12h",
  });

  await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

  return {
    token,
    user: buildAuthUserPayload(user),
  };
};
