import express from "express";
import { reviewReconciliation } from "../controllers/reconciliationController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/:operationalDayId/review", roleMiddleware(["admin", "accountant"]), reviewReconciliation);

export default router;
