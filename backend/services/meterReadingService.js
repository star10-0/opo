import MeterReading from "../models/MeterReading.js";

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createMeterReading = async (payload) => {
  const requiredFields = [
    "stationId",
    "operationalDayId",
    "pumpAssignmentId",
    "pumpId",
    "fuelType",
    "readingType",
    "value",
    "recordedBy",
  ];

  for (const field of requiredFields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
      throw createServiceError(`${field} is required`, 400);
    }
  }

  return MeterReading.create(payload);
};

export const listMeterReadings = async (query = {}) => {
  const filters = { isDeleted: false };
  if (query.stationId) filters.stationId = query.stationId;
  if (query.operationalDayId) filters.operationalDayId = query.operationalDayId;
  if (query.pumpAssignmentId) filters.pumpAssignmentId = query.pumpAssignmentId;
  if (query.readingType) filters.readingType = query.readingType;

  return MeterReading.find(filters).sort({ recordedAt: -1, createdAt: -1 });
};

export const getMeterReadingById = async (id) => {
  const reading = await MeterReading.findOne({ _id: id, isDeleted: false });
  if (!reading) throw createServiceError("Meter reading not found", 404);
  return reading;
};

export const updateMeterReading = async (id, payload) => {
  const reading = await MeterReading.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true }
  );
  if (!reading) throw createServiceError("Meter reading not found", 404);
  return reading;
};

export const softDeleteMeterReading = async (id) => {
  const reading = await MeterReading.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!reading) throw createServiceError("Meter reading not found", 404);
  return reading;
};
