import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import { reviewReconciliation } from "../controllers/reconciliationController.js";

const router = express.Router();

router.post("/:operationalDayId/review", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), reviewReconciliation);

export default router;
