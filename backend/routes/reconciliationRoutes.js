import express from "express";
import { reviewReconciliation } from "../controllers/reconciliationController.js";

const router = express.Router();

router.post("/:operationalDayId/review", reviewReconciliation);

export default router;
