import Notification from "../models/Notification.js";
import WorkerClosing from "../models/WorkerClosing.js";
import ApprovalRequest from "../models/ApprovalRequest.js";
import StorageTank from "../models/StorageTank.js";
import OperationalDay from "../models/OperationalDay.js";

const severityRank = { high: 3, medium: 2, low: 1 };

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function sortByPriorityAndDate(rows = []) {
  return [...rows].sort((a, b) => {
    const priorityDiff = (severityRank[b.priority] || 0) - (severityRank[a.priority] || 0);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime();
  });
}

export const notificationService = {
  async create(payload) {
    return Notification.create(payload);
  },

  async list({ stationId, role, limit, types, priorities, q }) {
    const parsedLimit = Number(limit || 50);
    const safeLimit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50;
    const typeFilters = normalizeList(types);
    const priorityFilters = normalizeList(priorities);
    const searchQuery = String(q || "").trim().toLowerCase();

    const persistedFilters = { stationId, targetRole: role };
    if (typeFilters.length) persistedFilters.type = { $in: typeFilters };

    const rows = await Notification.find(persistedFilters)
      .sort({ createdAt: -1, date: -1 })
      .limit(safeLimit);

    const [variance, pendingClosings, approvals, lowTanks, staleOperationalDays] = await Promise.all([
      WorkerClosing.find({ stationId, isDeleted: false, variance: { $ne: 0 } }).sort({ createdAt: -1 }).limit(5),
      WorkerClosing.find({ stationId, isDeleted: false, status: "submitted" }).sort({ createdAt: -1 }).limit(5),
      ApprovalRequest.find({ stationId, isDeleted: false, finalStatus: "pending" }).sort({ createdAt: -1 }).limit(5),
      StorageTank.find({ stationId, isDeleted: false, $expr: { $lte: ["$currentQuantityLiters", "$lowLevelThreshold"] } }).limit(5),
      OperationalDay.find({ stationId, isDeleted: false, status: "open", openedAt: { $lte: new Date(Date.now() - (18 * 60 * 60 * 1000)) } }).sort({ openedAt: 1 }).limit(3),
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
      })),
      ...staleOperationalDays.map((day) => ({
        type: "stale_operational_day",
        source: "computed",
        priority: "high",
        createdAt: day.openedAt || day.createdAt,
        message: `اليوم التشغيلي ${day.operationalDate} ما زال مفتوحًا منذ فترة طويلة`,
      })),
    ];

    const merged = sortByPriorityAndDate([...computed, ...rows])
      .filter((row) => (typeFilters.length ? typeFilters.includes(String(row.type || "")) : true))
      .filter((row) => (priorityFilters.length ? priorityFilters.includes(String(row.priority || "")) : true))
      .filter((row) => {
        if (!searchQuery) return true;
        const message = String(row.message || "").toLowerCase();
        return message.includes(searchQuery);
      })
      .slice(0, safeLimit);

    return {
      items: merged,
      meta: {
        limit: safeLimit,
        computedCount: computed.length,
        persistedCount: rows.length,
        filters: {
          types: typeFilters,
          priorities: priorityFilters,
          q: searchQuery,
        },
      },
    };
  }
};
