import jwt from "jsonwebtoken";
import User from "../models/User.js";

const isStrictAuth = () => process.env.AUTH_REQUIRED === "true" || process.env.NODE_ENV === "production";

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token) {
    if (isStrictAuth()) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    req.user = {
      _id: null,
      role: req.headers["x-user-role"] || "admin",
      permissions: [],
      stationAccess: [],
      isDemo: true,
    };
    return next();
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: "JWT_SECRET is not configured" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id role permissions stationAccess isActive");

    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.user = user;
    return next();
  } catch {
    if (isStrictAuth()) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.user = {
      _id: null,
      role: req.headers["x-user-role"] || "admin",
      permissions: [],
      stationAccess: [],
      isDemo: true,
    };
    return next();
  }
};

export default auth;
