import { notificationService } from "../services/notificationService.js";

export async function listNotifications(req, res, next) {
  try {
    const stationId = req.query.stationId || req.query.stationIds || "";
    const data = await notificationService.list({
      stationId,
      role: req.query.role || "worker",
      limit: Number(req.query.limit || 100),
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
