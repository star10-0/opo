import mongoose from "mongoose";

const authEnforced = () => process.env.ENFORCE_AUTH === "true";

const hasGlobalStationAccess = (user) => {
  if (!user) return false;
  if (["admin", "manager"].includes(user.role)) return true;
  return Array.isArray(user.permissions) && user.permissions.includes("view_all_stations");
};

const normalizeStationIds = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeStationIds(item))
      .filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
};

const collectStationIds = (req) => {
  const candidates = [
    req.params?.stationId,
    req.query?.stationId,
    req.query?.stationIds,
    req.body?.stationId,
    req.body?.stationIds,
  ];

  return [...new Set(candidates.flatMap((item) => normalizeStationIds(item)))];
};

export const requireAuthIfEnabled = (req, res, next) => {
  if (!authEnforced()) {
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  next();
};

export const allowRolesIfEnabled = (roles = []) => (req, res, next) => {
  if (!authEnforced()) {
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  next();
};

export const enforceStationScopeIfEnabled = (req, res, next) => {
  if (!authEnforced()) {
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const stationIds = collectStationIds(req);
  if (!stationIds.length || hasGlobalStationAccess(req.user)) {
    return next();
  }

  const hasInvalidId = stationIds.some((id) => !mongoose.Types.ObjectId.isValid(id));
  if (hasInvalidId) {
    return res.status(400).json({ success: false, message: "Invalid stationId" });
  }

  const allowedStationIds = new Set((req.user.stationAccess || []).map((id) => String(id)));
  const hasUnauthorizedStation = stationIds.some((id) => !allowedStationIds.has(String(id)));

  if (hasUnauthorizedStation) {
    console.warn(`[SECURITY] Station scope violation by user ${req.user._id} on ${req.method} ${req.originalUrl}`);
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  next();
};
