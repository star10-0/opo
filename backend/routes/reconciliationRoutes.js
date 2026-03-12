import express from "express";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { reviewReconciliation } from "../controllers/reconciliationController.js";

const router = express.Router();

router.post("/:operationalDayId/review", roleMiddleware(["accountant", "manager", "admin"]), reviewReconciliation);

export default router;
