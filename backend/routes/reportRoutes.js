import express from "express";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { reportService } from "../services/reportService.js";

const router = express.Router();
router.use(roleMiddleware(["admin", "accountant"]));

router.get("/daily", async (req, res, next) => {
  try {
    const data = await reportService.workerClosingSummary(req.query, { includeItems: true });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get("/weekly", async (req, res, next) => {
  try {
    const data = await reportService.workerClosingSummary(req.query, { includeComparisons: true });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get("/monthly", async (req, res, next) => {
  try {
    const data = await reportService.workerClosingSummary(req.query, { includeComparisons: true });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get("/variances", async (req, res, next) => {
  try {
    const data = await reportService.workerClosingSummary(req.query, { includeItems: true });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get("/distribution-vehicle", async (req, res, next) => {
  try {
    const data = await reportService.distributionVehicleSummary(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
