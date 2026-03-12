import Pump from "../models/Pump.js";

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createPump = async (payload) => {
  if (!payload.stationId || !payload.pumpName || !payload.pumpCode || !payload.fuelType) {
    throw createServiceError("stationId, pumpName, pumpCode, and fuelType are required", 400);
  }

  return Pump.create(payload);
};

export const listPumps = async (query = {}) => {
  const filters = { isDeleted: false };
  if (query.stationId) filters.stationId = query.stationId;
  if (query.isActive !== undefined) filters.isActive = query.isActive === "true";
  return Pump.find(filters).sort({ createdAt: -1 });
};

export const getPumpById = async (id) => {
  const pump = await Pump.findOne({ _id: id, isDeleted: false });
  if (!pump) throw createServiceError("Pump not found", 404);
  return pump;
};

export const updatePump = async (id, payload) => {
  const pump = await Pump.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true }
  );
  if (!pump) throw createServiceError("Pump not found", 404);
  return pump;
};

export const softDeletePump = async (id) => {
  const pump = await Pump.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), isActive: false },
    { new: true }
  );
  if (!pump) throw createServiceError("Pump not found", 404);
  return pump;
};
