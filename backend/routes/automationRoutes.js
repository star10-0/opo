import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import { automationService } from "../services/automationService.js";

const router = express.Router();

router.use(requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]));

router.get("/preview", async (req, res) => {
  try {
    const data = await automationService.preview({
      stationId: req.query.stationId,
      stationIds: req.query.stationIds,
      daysBack: req.query.daysBack,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/run-manual", async (req, res) => {
  try {
    const data = await automationService.runManual({
      stationId: req.body.stationId,
      stationIds: req.body.stationIds,
      daysBack: req.body.daysBack,
      channels: req.body.channels,
      dryRun: req.body.dryRun !== false,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/pending-review-reminders", async (req, res) => {
  try {
    const data = await automationService.pendingReviewBacklog({ stationId: req.query.stationId });
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get("/integration-catalog", (req, res) => {
  res.json({
    success: true,
    data: {
      channels: [
        { key: "in_app", status: "active", notes: "تنبيهات داخل النظام" },
        { key: "email", status: "ready", notes: "جاهز للربط عبر SMTP/Provider" },
        { key: "sms_whatsapp", status: "ready", notes: "جاهز لربط مزود رسائل" },
        { key: "gps", status: "ready", notes: "نقطة توسع لربط مواقع سيارات التوزيع" },
        { key: "accounting", status: "ready", notes: "تصدير قيود محاسبية أو Webhook" },
        { key: "spreadsheet", status: "active", notes: "تصدير CSV متاح حاليًا" },
      ],
      extensionNotes: [
        "لا يوجد اعتماد على مزود خارجي داخل هذا الإصدار.",
        "تنفيذ الإرسال الفعلي يتم لاحقًا عبر adapter لكل قناة.",
        "تم الإبقاء على run-manual بصيغة dry-run افتراضيًا للأمان.",
      ],
    },
  });
});

export default router;
