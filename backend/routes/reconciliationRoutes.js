import express from "express";
import { requireAuthIfEnabled } from "../middleware/accessControl.js";
import { reviewReconciliation } from "../controllers/reconciliationController.js";

const router = express.Router();

router.use(requireAuthIfEnabled);

router.post("/:operationalDayId/review", reviewReconciliation);

export default router;
