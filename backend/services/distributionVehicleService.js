import DistributionVehicle from "../models/DistributionVehicle.js";
import { auditLogService } from "./auditLogService.js";

export const distributionVehicleService = {
  async create(payload, actor) {
    const vehicle = await DistributionVehicle.create(payload);
    await auditLogService.logSensitiveAction({
      stationId: vehicle.stationId,
      userId: actor.userId,
      actionType: "create_distribution_vehicle",
      entityType: "DistributionVehicle",
      entityId: vehicle._id,
      afterData: vehicle.toObject(),
      ipAddress: actor.ipAddress || "",
    });
    return vehicle;
  },

  async list(stationId) {
    return DistributionVehicle.find({ stationId, isDeleted: false }).sort({ vehicleName: 1 });
  },
};
