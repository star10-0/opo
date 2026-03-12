import PumpAssignment from "../models/PumpAssignment.js";

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createPumpAssignment = async (payload) => {
  const requiredFields = ["stationId", "operationalDayId", "pumpId", "primaryWorkerId", "openingReading"];
  for (const field of requiredFields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
      throw createServiceError(`${field} is required`, 400);
    }
  }

  return PumpAssignment.create(payload);
};

export const lockPumpAssignmentOpening = async (id) => {
  const assignment = await PumpAssignment.findOne({ _id: id, isDeleted: false });
  if (!assignment) throw createServiceError("Pump assignment not found", 404);

  assignment.openingReadingLocked = true;
  return assignment.save();
};

export const closePumpAssignment = async (id, payload) => {
  const assignment = await PumpAssignment.findOne({ _id: id, isDeleted: false });
  if (!assignment) throw createServiceError("Pump assignment not found", 404);

  if (payload.closingReading !== undefined) {
    assignment.closingReading = payload.closingReading;
  }
  assignment.closingReadingRecordedBy = payload.closingReadingRecordedBy ?? assignment.closingReadingRecordedBy;
  assignment.closingReadingRecordedAt = payload.closingReadingRecordedAt ?? new Date();
  assignment.assignmentEndAt = payload.assignmentEndAt ?? new Date();
  assignment.status = "closed";

  return assignment.save();
};

export const listPumpAssignments = async (query = {}) => {
  const filters = { isDeleted: false };
  if (query.stationId) filters.stationId = query.stationId;
  if (query.operationalDayId) filters.operationalDayId = query.operationalDayId;
  if (query.pumpId) filters.pumpId = query.pumpId;
  if (query.status) filters.status = query.status;

  return PumpAssignment.find(filters).sort({ createdAt: -1 });
};

export const getPumpAssignmentById = async (id) => {
  const assignment = await PumpAssignment.findOne({ _id: id, isDeleted: false });
  if (!assignment) throw createServiceError("Pump assignment not found", 404);
  return assignment;
};

export const updatePumpAssignment = async (id, payload) => {
  if (Object.prototype.hasOwnProperty.call(payload, "openingReading")) {
    const existing = await PumpAssignment.findOne({ _id: id, isDeleted: false });
    if (!existing) throw createServiceError("Pump assignment not found", 404);
    if (existing.openingReadingLocked) {
      throw createServiceError(
        "openingReading is locked. TODO: integrate ApprovalRequest flow for unlocking archived/sensitive edits",
        409
      );
    }
  }

  const assignment = await PumpAssignment.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true }
  );
  if (!assignment) throw createServiceError("Pump assignment not found", 404);
  return assignment;
};

export const softDeletePumpAssignment = async (id) => {
  const assignment = await PumpAssignment.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!assignment) throw createServiceError("Pump assignment not found", 404);
  return assignment;
};
