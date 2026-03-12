import OperationalDay from "../models/OperationalDay.js";

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureRequired = (payload, fields) => {
  for (const field of fields) {
    if (!payload[field]) {
      throw createServiceError(`${field} is required`, 400);
    }
  }
};

export const openOperationalDay = async (payload) => {
  ensureRequired(payload, ["stationId", "operationalDate"]);

  const existing = await OperationalDay.findOne({
    stationId: payload.stationId,
    operationalDate: payload.operationalDate,
    status: "open",
    isDeleted: false,
  });

  if (existing) {
    throw createServiceError("An open operational day already exists for this station and date", 409);
  }

  return OperationalDay.create({
    stationId: payload.stationId,
    operationalDate: payload.operationalDate,
    autoOpenTime: payload.autoOpenTime ?? null,
    openedAt: payload.openedAt ?? new Date(),
    openedAutomatically: payload.openedAutomatically ?? false,
    notes: payload.notes ?? "",
    status: "open",
  });
};

export const closeOperationalDay = async (id) => {
  const day = await OperationalDay.findOne({ _id: id, isDeleted: false });
  if (!day) throw createServiceError("Operational day not found", 404);
  if (day.status === "closed") return day;

  day.status = "closed";
  day.closedAt = new Date();
  return day.save();
};

export const listOperationalDays = async (query = {}) => {
  const filters = { isDeleted: false };
  if (query.stationId) filters.stationId = query.stationId;
  if (query.status) filters.status = query.status;
  return OperationalDay.find(filters).sort({ operationalDate: -1, createdAt: -1 });
};

export const getOperationalDayById = async (id) => {
  const day = await OperationalDay.findOne({ _id: id, isDeleted: false });
  if (!day) throw createServiceError("Operational day not found", 404);
  return day;
};

export const updateOperationalDay = async (id, payload) => {
  const day = await OperationalDay.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true }
  );
  if (!day) throw createServiceError("Operational day not found", 404);
  return day;
};

export const softDeleteOperationalDay = async (id) => {
  const day = await OperationalDay.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!day) throw createServiceError("Operational day not found", 404);
  return day;
};
