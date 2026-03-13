import { notificationService } from "../services/notificationService.js";

export async function listNotifications(req, res, next) {
  try {
    if (!req.query.stationId) {
      throw new Error("stationId مطلوب لعرض التنبيهات");
    }

    const data = await notificationService.list({
      stationId: req.query.stationId,
      role: req.query.role || "worker",
      limit: req.query.limit,
      types: req.query.types,
      priorities: req.query.priorities,
      q: req.query.q,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
