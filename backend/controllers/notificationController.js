import { notificationService } from "../services/notificationService.js";

export async function listNotifications(req, res, next) {
  try {
    const data = await notificationService.list({ stationId: req.query.stationId, role: req.query.role || "worker" });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
