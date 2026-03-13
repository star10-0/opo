import Notification from "../models/Notification.js";
import WorkerClosing from "../models/WorkerClosing.js";
import ApprovalRequest from "../models/ApprovalRequest.js";
import StorageTank from "../models/StorageTank.js";
import Station from "../models/Station.js";

const ROLE_PRIORITY = ["admin", "accountant", "manager", "worker"];

const normalizeStationIds = (stationId) => {
  if (Array.isArray(stationId)) return stationId.filter(Boolean).map(String);
  if (typeof stationId === "string") {
    return stationId
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }
  return stationId ? [String(stationId)] : [];
};

const resolveStations = async (stationIds = []) => {
  if (!stationIds.length) return [];
  const rows = await Station.find({ _id: { $in: stationIds }, isDeleted: false }).select("_id name code").lean();
  return rows;
};

const sumVariance = (rows = []) => rows.reduce((acc, row) => acc + Number(row.variance || 0), 0);

const buildAggregateNotifications = ({ stationMeta = [], variances = [], pendingClosings = [], approvals = [], lowTanks = [] }) => {
  const criticalLowTanks = lowTanks.filter((row) => Number(row.fillRatioPercent) <= 5);
  const highVarianceRows = variances.filter((row) => Math.abs(Number(row.variance || 0)) >= 1000);

  const stationLabel = stationMeta.length === 1
    ? `${stationMeta[0].name || stationMeta[0].code || "المحطة"}`
    : `(${stationMeta.length}) محطات`;

  const aggregate = [];
  if (pendingClosings.length) {
    aggregate.push({
      type: "pending_closing_summary",
      severity: pendingClosings.length >= 8 ? "high" : "medium",
      message: `يوجد ${pendingClosings.length} إغلاق عامل بانتظار المراجعة ${stationLabel}.`,
      actionLabel: "راجع إغلاقات العاملين",
      date: new Date(),
      stationScope: stationMeta.map((s) => s._id),
    });
  }

  if (approvals.length) {
    aggregate.push({
      type: "approval_pending_summary",
      severity: approvals.length >= 5 ? "high" : "medium",
      message: `يوجد ${approvals.length} طلب موافقة معلق ${stationLabel}.`,
      actionLabel: "افتح شاشة الموافقات",
      date: new Date(),
      stationScope: stationMeta.map((s) => s._id),
    });
  }

  if (lowTanks.length) {
    aggregate.push({
      type: "low_tanks_summary",
      severity: criticalLowTanks.length ? "critical" : "high",
      message: criticalLowTanks.length
        ? `تحذير حرج: ${criticalLowTanks.length} خزان تحت 5% ${stationLabel}.`
        : `تنبيه مخزون: ${lowTanks.length} خزان عند/تحت حد التنبيه ${stationLabel}.`,
      actionLabel: "راجع الخزانات والتوريدات",
      date: new Date(),
      stationScope: stationMeta.map((s) => s._id),
    });
  }

  if (highVarianceRows.length) {
    aggregate.push({
      type: "high_variance_summary",
      severity: "high",
      message: `تم رصد ${highVarianceRows.length} إغلاق بفروقات عالية (≥ 1000) بإجمالي ${sumVariance(highVarianceRows).toFixed(2)}.`,
      actionLabel: "راجع تقرير الفروقات",
      date: new Date(),
      stationScope: stationMeta.map((s) => s._id),
    });
  }

  return aggregate;
};

export const notificationService = {
  async create(payload) {
    return Notification.create(payload);
  },

  async list({ stationId, role, limit = 100 }) {
    const stationIds = normalizeStationIds(stationId);
    const targetRoles = role ? [role] : ROLE_PRIORITY;
    const stationFilter = stationIds.length ? { stationId: { $in: stationIds } } : {};

    const rows = await Notification.find({ ...stationFilter, targetRole: { $in: targetRoles } })
      .sort({ createdAt: -1, date: -1 })
      .limit(Math.min(200, Number(limit || 100)))
      .lean();

    const [stationMeta, variance, pendingClosings, approvals, lowTanks] = await Promise.all([
      resolveStations(stationIds),
      WorkerClosing.find({ ...stationFilter, isDeleted: false, variance: { $ne: 0 } })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("_id stationId variance createdAt")
        .lean(),
      WorkerClosing.find({ ...stationFilter, isDeleted: false, status: "submitted" })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("_id stationId createdAt")
        .lean(),
      ApprovalRequest.find({ ...stationFilter, isDeleted: false, finalStatus: "pending" })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("_id stationId requestType createdAt")
        .lean(),
      StorageTank.find({ ...stationFilter, isDeleted: false, $expr: { $lte: ["$currentQuantityLiters", "$lowLevelThreshold"] } })
        .limit(10)
        .select("_id stationId tankName currentQuantityLiters lowLevelThreshold")
        .lean()
    ]);

    const enrichedTanks = lowTanks.map((tank) => ({
      ...tank,
      fillRatioPercent: tank.lowLevelThreshold > 0 ? (Number(tank.currentQuantityLiters || 0) / Number(tank.lowLevelThreshold || 1)) * 100 : 0,
    }));

    const computed = [
      ...buildAggregateNotifications({
        stationMeta,
        variances: variance,
        pendingClosings,
        approvals,
        lowTanks: enrichedTanks,
      }),
      ...variance.map((v) => ({
        type: "variance",
        severity: Math.abs(Number(v.variance || 0)) >= 1000 ? "high" : "medium",
        message: `تنبيه فرق مالي في حساب ${v._id}: ${v.variance}`,
        actionLabel: "فتح تقرير الفروقات",
        date: v.createdAt,
        stationId: v.stationId,
      })),
      ...pendingClosings.map((v) => ({
        type: "pending_closing",
        severity: "medium",
        message: `تنبيه حساب معلق للمراجعة: ${v._id}`,
        actionLabel: "مراجعة الإغلاق",
        date: v.createdAt,
        stationId: v.stationId,
      })),
      ...approvals.map((v) => ({
        type: "approval_new",
        severity: "high",
        message: `طلب موافقة جديد: ${v.requestType}`,
        actionLabel: "مراجعة الطلب",
        date: v.createdAt,
        stationId: v.stationId,
      })),
      ...enrichedTanks.map((v) => ({
        type: "tank_low",
        severity: Number(v.fillRatioPercent) <= 5 ? "critical" : "high",
        message: `انخفاض مستوى الخزان ${v.tankName}`,
        actionLabel: "فتح صفحة الخزانات",
        date: new Date(),
        stationId: v.stationId,
      }))
    ];

    return [...computed, ...rows].sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
  }
};
