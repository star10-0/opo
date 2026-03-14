import { enterpriseReadinessService } from "./enterpriseReadinessService.js";
import ApprovalRequest from "../models/ApprovalRequest.js";
import WorkerClosing from "../models/WorkerClosing.js";
import Station from "../models/Station.js";

const integrationChannels = {
  in_app: { enabled: true, mode: "native" },
  email: { enabled: false, mode: "integration-ready" },
  sms_whatsapp: { enabled: false, mode: "integration-ready" },
  gps: { enabled: false, mode: "integration-ready" },
  accounting: { enabled: false, mode: "integration-ready" },
  spreadsheet: { enabled: true, mode: "csv-export" },
};

function normalizeChannels(channels = []) {
  const list = Array.isArray(channels) ? channels : String(channels || "").split(",");
  return list.map((item) => String(item).trim()).filter((item) => integrationChannels[item]);
}

function makeDispatchResult(channels, payloadSize, dryRun) {
  return channels.map((channel) => ({
    channel,
    accepted: true,
    mode: integrationChannels[channel].mode,
    deliveryStatus: dryRun ? "dry-run" : "queued",
    payloadSize,
  }));
}

export const automationService = {
  async preview({ stationId, stationIds, daysBack = 7 }) {
    const oversight = await enterpriseReadinessService.buildOversight({ stationId, stationIds, daysBack });

    const reminders = [];
    for (const station of oversight.stations) {
      if (station.pendingApprovals > 0) {
        reminders.push({
          type: "pending_approvals_reminder",
          stationId: station.stationId,
          priority: station.pendingApprovals > 3 ? "high" : "medium",
          message: `يوجد ${station.pendingApprovals} طلب موافقة معلق في المحطة ${station.stationId}.`,
        });
      }
      if (station.lowTanks > 0) {
        reminders.push({
          type: "low_tank_reminder",
          stationId: station.stationId,
          priority: "high",
          message: `يوجد ${station.lowTanks} خزان منخفض المستوى في المحطة ${station.stationId}.`,
        });
      }
      if (station.staleOperationalDays > 0) {
        reminders.push({
          type: "stale_day_reminder",
          stationId: station.stationId,
          priority: "high",
          message: `اليوم التشغيلي المفتوح منذ فترة يحتاج إغلاقًا في المحطة ${station.stationId}.`,
        });
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      oversightSummary: oversight.summary,
      reminderQueue: reminders,
      channels: integrationChannels,
      nextRecommendedJobs: oversight.extensionPoints.scheduledJobs,
    };
  },

  async runManual({ stationId, stationIds, channels, daysBack = 7, dryRun = true }) {
    const preview = await this.preview({ stationId, stationIds, daysBack });
    const selectedChannels = normalizeChannels(channels);
    const fallbackChannels = selectedChannels.length ? selectedChannels : ["in_app"];
    const dispatches = makeDispatchResult(fallbackChannels, preview.reminderQueue.length, dryRun);

    return {
      runMode: dryRun ? "dry-run" : "manual-dispatch",
      preview,
      dispatches,
    };
  },

  async pendingReviewBacklog({ stationId }) {
    if (!stationId) {
      throw new Error("stationId مطلوب");
    }

    const now = Date.now();
    const [station, approvals, closings] = await Promise.all([
      Station.findOne({ _id: stationId, isDeleted: false }).lean(),
      ApprovalRequest.find({ stationId, isDeleted: false, finalStatus: "pending" }).lean(),
      WorkerClosing.find({ stationId, isDeleted: false, status: "submitted" }).lean(),
    ]);

    const approvalOverdueHours = Number(station?.projectCustomization?.alerts?.approvalOverdueHours || 24);
    const closingOverdueHours = Number(station?.projectCustomization?.alerts?.closingOverdueHours || 12);

    const approvalOverdueMs = approvalOverdueHours * 60 * 60 * 1000;
    const closingOverdueMs = closingOverdueHours * 60 * 60 * 1000;

    const reminders = [
      ...approvals
        .filter((row) => now - new Date(row.createdAt || row.updatedAt || now).getTime() >= approvalOverdueMs)
        .map((row) => ({
          type: "approval_pending_over_threshold",
          priority: "high",
          referenceId: row._id,
          message: `طلب موافقة معلق لأكثر من ${approvalOverdueHours} ساعة (${row.requestType || "unknown"}).`,
        })),
      ...closings
        .filter((row) => now - new Date(row.createdAt || row.updatedAt || now).getTime() >= closingOverdueMs)
        .map((row) => ({
          type: "closing_pending_over_threshold",
          priority: "medium",
          referenceId: row._id,
          message: `إغلاق عامل مرسل للمراجعة منذ أكثر من ${closingOverdueHours} ساعة.`,
        })),
    ];

    return {
      stationId,
      generatedAt: new Date().toISOString(),
      thresholds: {
        approvalOverdueHours,
        closingOverdueHours,
      },
      reminders,
      totals: {
        pendingApprovals: approvals.length,
        submittedClosings: closings.length,
        overdueReminders: reminders.length,
      },
    };
  },
};
