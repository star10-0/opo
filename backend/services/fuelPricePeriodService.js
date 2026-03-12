import FuelPricePeriod from "../models/FuelPricePeriod.js";

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createFuelPricePeriod = async (payload) => {
  const requiredFields = [
    "stationId",
    "operationalDayId",
    "pumpAssignmentId",
    "fuelType",
    "pricePerLiter",
    "startReadingValue",
  ];

  for (const field of requiredFields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
      throw createServiceError(`${field} is required`, 400);
    }
  }

  return FuelPricePeriod.create(payload);
};

export const closeFuelPricePeriod = async (id, payload) => {
  const period = await FuelPricePeriod.findOne({ _id: id, isDeleted: false });
  if (!period) throw createServiceError("Fuel price period not found", 404);

  period.endReadingValue = payload.endReadingValue ?? period.endReadingValue;
  period.endedAt = payload.endedAt ?? new Date();
  period.status = "closed";

  return period.save();
};

export const listFuelPricePeriods = async (query = {}) => {
  const filters = { isDeleted: false };
  if (query.stationId) filters.stationId = query.stationId;
  if (query.operationalDayId) filters.operationalDayId = query.operationalDayId;
  if (query.pumpAssignmentId) filters.pumpAssignmentId = query.pumpAssignmentId;
  if (query.status) filters.status = query.status;

  return FuelPricePeriod.find(filters).sort({ startedAt: -1, createdAt: -1 });
};

export const getFuelPricePeriodById = async (id) => {
  const period = await FuelPricePeriod.findOne({ _id: id, isDeleted: false });
  if (!period) throw createServiceError("Fuel price period not found", 404);
  return period;
};

export const updateFuelPricePeriod = async (id, payload) => {
  const period = await FuelPricePeriod.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true }
  );
  if (!period) throw createServiceError("Fuel price period not found", 404);
  return period;
};

export const softDeleteFuelPricePeriod = async (id) => {
  const period = await FuelPricePeriod.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), status: "suspended" },
    { new: true }
  );
  if (!period) throw createServiceError("Fuel price period not found", 404);
  return period;
};
