import { distributionVehicleService } from "../services/distributionVehicleService.js";

export async function createDistributionVehicle(req, res, next) {
  try {
    const vehicle = await distributionVehicleService.create(req.body, {
      userId: req.body.createdBy,
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
}

export async function listDistributionVehicles(req, res, next) {
  try {
    const data = await distributionVehicleService.list(req.query.stationId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
