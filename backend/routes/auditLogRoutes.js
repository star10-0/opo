import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import { listAuditLogs } from "../controllers/auditLogController.js";

const router = express.Router();

router.get("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), listAuditLogs);

export default router;
