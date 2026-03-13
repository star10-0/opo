import Notification from "../models/Notification.js";
import WorkerClosing from "../models/WorkerClosing.js";
import ApprovalRequest from "../models/ApprovalRequest.js";
import StorageTank from "../models/StorageTank.js";

export const notificationService = {
  async create(payload) {
    return Notification.create(payload);
  },

  async list({ stationId, role }) {
    const rows = await Notification.find({ stationId, targetRole: role }).sort({ createdAt: -1, date: -1 }).limit(100);

    const [variance, pendingClosings, approvals, lowTanks] = await Promise.all([
      WorkerClosing.find({ stationId, isDeleted: false, variance: { $ne: 0 } }).sort({ createdAt: -1 }).limit(5),
      WorkerClosing.find({ stationId, isDeleted: false, status: "submitted" }).sort({ createdAt: -1 }).limit(5),
      ApprovalRequest.find({ stationId, isDeleted: false, finalStatus: "pending" }).sort({ createdAt: -1 }).limit(5),
      StorageTank.find({ stationId, isDeleted: false, $expr: { $lte: ["$currentQuantityLiters", "$lowLevelThreshold"] } }).limit(5)
    ]);

    const computed = [
      ...variance.map((v) => ({ type: "variance", message: `تنبيه فرق مالي في حساب ${v._id}: ${v.variance}` })),
      ...pendingClosings.map((v) => ({ type: "pending_closing", message: `تنبيه حساب معلق للمراجعة: ${v._id}` })),
      ...approvals.map((v) => ({ type: "approval_new", message: `طلب موافقة جديد: ${v.requestType}` })),
      ...lowTanks.map((v) => ({ type: "tank_low", message: `انخفاض مستوى الخزان ${v.tankName}` }))
    ];

    return [...computed, ...rows];
  }
};
