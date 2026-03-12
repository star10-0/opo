import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  accountantDecision,
  createApprovalRequest,
  listApprovalRequests,
  managerDecision,
} from "../controllers/approvalController.js";

const router = express.Router();

router.get("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), listApprovalRequests);
router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant", "worker"]), createApprovalRequest);
router.post("/:id/accountant-decision", requireAuthIfEnabled, allowRolesIfEnabled(["accountant"]), accountantDecision);
router.post("/:id/manager-decision", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), managerDecision);

export default router;
