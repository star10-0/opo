import express from "express";
import {
  accountantDecision,
  createApprovalRequest,
  listApprovalRequests,
  managerDecision,
} from "../controllers/approvalController.js";

const router = express.Router();

router.get("/", listApprovalRequests);
router.post("/", createApprovalRequest);
router.post("/:id/accountant-decision", accountantDecision);
router.post("/:id/manager-decision", managerDecision);

export default router;
