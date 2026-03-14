import WorkerClosing from "../models/WorkerClosing.js";
import ApprovalRequest from "../models/ApprovalRequest.js";
import StorageTank from "../models/StorageTank.js";
import OperationalDay from "../models/OperationalDay.js";

const MS_IN_HOUR = 60 * 60 * 1000;

function normalizeStationIds(stationId, stationIds) {
  const fromList = String(stationIds || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (fromList.length) return fromList;
  return stationId ? [stationId] : [];
}

function buildDateRange(daysBack = 7) {
  const safeDays = Math.min(Math.max(Number(daysBack || 7), 1), 90);
  const end = new Date();
  const start = new Date(end.getTime() - safeDays * 24 * MS_IN_HOUR);
  return { start, end, safeDays };
}

function calcRiskScore(metrics) {
  const score =
    Math.min(metrics.pendingApprovals * 8, 24)
    + Math.min(metrics.submittedClosings * 5, 20)
    + Math.min(metrics.suspendedClosings * 6, 18)
    + Math.min(metrics.lowTanks * 7, 21)
    + Math.min(metrics.staleOperationalDays * 9, 27)
    + (Math.abs(metrics.varianceRatePct) > 2 ? 10 : 0);

  return Math.min(score, 100);
}

function buildActions(metrics) {
  const actions = [];
  if (metrics.pendingApprovals > 0) actions.push("مراجعة طلبات الموافقة المعلقة وتحديد مسؤول المتابعة اليومي.");
  if (metrics.submittedClosings > 0) actions.push("تصفية الإغلاقات المرسلة للمحاسبة لمنع تراكم الذمم.");
  if (metrics.lowTanks > 0) actions.push("جدولة توريد عاجل للخزانات منخفضة المستوى.");
  if (metrics.staleOperationalDays > 0) actions.push("إغلاق اليوم التشغيلي المفتوح منذ مدة أو توثيق سبب الاستمرار.");
  if (!actions.length) actions.push("لا توجد مؤشرات خطر عالية، استمر في المراجعة الدورية.");
  return actions;
}

export const enterpriseReadinessService = {
  normalizeStationIds,

  async buildOversight({ stationId, stationIds, daysBack = 7 }) {
    const scopedStationIds = normalizeStationIds(stationId, stationIds);
    const { start, end, safeDays } = buildDateRange(daysBack);

    const workerBaseFilter = {
      isDeleted: false,
      createdAt: { $gte: start, $lte: end },
      ...(scopedStationIds.length ? { stationId: { $in: scopedStationIds } } : {}),
    };

    const [closings, approvals, tanks, staleDays] = await Promise.all([
      WorkerClosing.find(workerBaseFilter).lean(),
      ApprovalRequest.find({
        isDeleted: false,
        finalStatus: "pending",
        ...(scopedStationIds.length ? { stationId: { $in: scopedStationIds } } : {}),
      }).lean(),
      StorageTank.find({
        isDeleted: false,
        ...(scopedStationIds.length ? { stationId: { $in: scopedStationIds } } : {}),
      }).lean(),
      OperationalDay.find({
        isDeleted: false,
        status: "open",
        openedAt: { $lte: new Date(Date.now() - 18 * MS_IN_HOUR) },
        ...(scopedStationIds.length ? { stationId: { $in: scopedStationIds } } : {}),
      }).lean(),
    ]);

    const bucket = {};
    const ensure = (id) => {
      const key = String(id || "unknown");
      if (!bucket[key]) {
        bucket[key] = {
          stationId: key,
          totalAmount: 0,
          totalVariance: 0,
          submittedClosings: 0,
          suspendedClosings: 0,
          pendingApprovals: 0,
          lowTanks: 0,
          staleOperationalDays: 0,
          varianceRatePct: 0,
          riskScore: 0,
          riskBand: "low",
          suggestedActions: [],
        };
      }
      return bucket[key];
    };

    closings.forEach((row) => {
      const metrics = ensure(row.stationId);
      metrics.totalAmount += Number(row.grossSalesAmount || 0);
      metrics.totalVariance += Number(row.variance || 0);
      if (row.status === "submitted") metrics.submittedClosings += 1;
      if (row.status === "suspended") metrics.suspendedClosings += 1;
    });

    approvals.forEach((row) => {
      const metrics = ensure(row.stationId);
      metrics.pendingApprovals += 1;
    });

    tanks.forEach((row) => {
      const metrics = ensure(row.stationId);
      if (Number(row.currentQuantityLiters || 0) <= Number(row.lowLevelThreshold || 0)) {
        metrics.lowTanks += 1;
      }
    });

    staleDays.forEach((row) => {
      const metrics = ensure(row.stationId);
      metrics.staleOperationalDays += 1;
    });

    const stations = Object.values(bucket).map((metrics) => {
      const varianceRatePct = metrics.totalAmount
        ? Number(((metrics.totalVariance / metrics.totalAmount) * 100).toFixed(2))
        : 0;
      const riskScore = calcRiskScore({ ...metrics, varianceRatePct });
      const riskBand = riskScore >= 70 ? "high" : riskScore >= 35 ? "medium" : "low";

      return {
        ...metrics,
        varianceRatePct,
        riskScore,
        riskBand,
        suggestedActions: buildActions({ ...metrics, varianceRatePct }),
      };
    }).sort((a, b) => b.riskScore - a.riskScore);

    const summary = stations.reduce((acc, station) => {
      acc.stationsCount += 1;
      acc.pendingApprovals += station.pendingApprovals;
      acc.lowTanks += station.lowTanks;
      acc.submittedClosings += station.submittedClosings;
      acc.suspendedClosings += station.suspendedClosings;
      acc.staleOperationalDays += station.staleOperationalDays;
      if (station.riskBand === "high") acc.highRiskStations += 1;
      return acc;
    }, {
      stationsCount: 0,
      highRiskStations: 0,
      pendingApprovals: 0,
      lowTanks: 0,
      submittedClosings: 0,
      suspendedClosings: 0,
      staleOperationalDays: 0,
    });

    return {
      period: { start, end, daysBack: safeDays },
      stationsScope: scopedStationIds,
      summary,
      stations,
      extensionPoints: {
        connectors: ["email", "sms_whatsapp", "gps", "accounting", "spreadsheet"],
        scheduledJobs: ["daily_digest", "pending_review_reminder", "low_tank_watch"],
      },
    };
  },
};
