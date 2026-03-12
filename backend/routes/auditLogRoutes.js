import express from "express";
import { listAuditLogs } from "../controllers/auditLogController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", roleMiddleware(["admin", "accountant"]), listAuditLogs);

export default router;
