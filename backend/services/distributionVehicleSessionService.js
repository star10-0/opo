import DistributionVehicleSession from "../models/DistributionVehicleSession.js";
import { auditLogService } from "./auditLogService.js";

export const distributionVehicleSessionService = {
  async openSession(payload, actor) {
    const session = await DistributionVehicleSession.create({ ...payload, status: "open" });

    await auditLogService.logSensitiveAction({
      stationId: session.stationId,
      userId: actor.userId,
      actionType: "open_distribution_vehicle_session",
      entityType: "DistributionVehicleSession",
      entityId: session._id,
      afterData: session.toObject(),
      ipAddress: actor.ipAddress || "",
    });

    return session;
  },

  async closeSession(id, payload, actor) {
    const session = await DistributionVehicleSession.findOne({ _id: id, isDeleted: false });
    if (!session) throw new Error("Distribution vehicle session not found");

    const before = session.toObject();
    const closingReading = Number(payload.closingReading);
    if (closingReading < session.openingReading) {
      throw new Error("Closing reading cannot be lower than opening reading");
    }

    session.closingReading = closingReading;
    session.totalSoldLiters = closingReading - session.openingReading;
    session.totalAmount = session.totalSoldLiters * Number(payload.unitPrice || 0);
    session.status = "closed";
    await session.save();

    await auditLogService.logSensitiveAction({
      stationId: session.stationId,
      userId: actor.userId,
      actionType: "close_distribution_vehicle_session",
      entityType: "DistributionVehicleSession",
      entityId: session._id,
      beforeData: before,
      afterData: session.toObject(),
      ipAddress: actor.ipAddress || "",
    });

    return session;
  },
};
