import Notification from "../models/Notification.js";
import WorkerClosing from "../models/WorkerClosing.js";
import ApprovalRequest from "../models/ApprovalRequest.js";
import StorageTank from "../models/StorageTank.js";

export const notificationService = {
  async create(payload) {
    return Notification.create(payload);
  },

  async list({ stationId, role, limit }) {
    const parsedLimit = Number(limit || 50);
    const safeLimit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50;

    const rows = await Notification.find({ stationId, targetRole: role })
      .sort({ createdAt: -1, date: -1 })
      .limit(safeLimit);

    const [variance, pendingClosings, approvals, lowTanks] = await Promise.all([
      WorkerClosing.find({ stationId, isDeleted: false, variance: { $ne: 0 } }).sort({ createdAt: -1 }).limit(5),
      WorkerClosing.find({ stationId, isDeleted: false, status: "submitted" }).sort({ createdAt: -1 }).limit(5),
      ApprovalRequest.find({ stationId, isDeleted: false, finalStatus: "pending" }).sort({ createdAt: -1 }).limit(5),
      StorageTank.find({ stationId, isDeleted: false, $expr: { $lte: ["$currentQuantityLiters", "$lowLevelThreshold"] } }).limit(5)
    ]);

    const computed = [
      ...variance.map((v) => ({
        type: "variance",
        source: "computed",
        priority: "high",
        createdAt: v.createdAt,
        message: `تنبيه فرق مالي في حساب ${v._id}: ${v.variance}`,
      })),
      ...pendingClosings.map((v) => ({
        type: "pending_closing",
        source: "computed",
        priority: "medium",
        createdAt: v.createdAt,
        message: `تنبيه حساب مرسل للمراجعة: ${v._id}`,
      })),
      ...approvals.map((v) => ({
        type: "approval_new",
        source: "computed",
        priority: "high",
        createdAt: v.createdAt,
        message: `طلب موافقة جديد: ${v.requestType}`,
      })),
      ...lowTanks.map((v) => ({
        type: "tank_low",
        source: "computed",
        priority: "medium",
        createdAt: v.updatedAt || v.createdAt,
        message: `انخفاض مستوى الخزان ${v.tankName}`,
      }))
    ];

    const merged = [...computed, ...rows]
      .sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime())
      .slice(0, safeLimit);

    return { items: merged, meta: { limit: safeLimit, computedCount: computed.length, persistedCount: rows.length } };
  }
};
