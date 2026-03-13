import { distributionVehicleSessionService } from "../services/distributionVehicleSessionService.js";

export async function openDistributionVehicleSession(req, res, next) {
  try {
    const session = await distributionVehicleSessionService.openSession(req.body, {
      userId: req.body.driverId,
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
}

export async function closeDistributionVehicleSession(req, res, next) {
  try {
    const session = await distributionVehicleSessionService.closeSession(req.params.id, req.body, {
      userId: req.body.userId,
      ipAddress: req.ip,
    });
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
}


export async function listDistributionVehicleSessions(req, res, next) {
  try {
    const sessions = await distributionVehicleSessionService.list(req.query.stationId);
    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
}
