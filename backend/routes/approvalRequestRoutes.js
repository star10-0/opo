import express from "express";
import {
  accountantDecision,
  createApprovalRequest,
  managerDecision,
} from "../controllers/approvalController.js";

const router = express.Router();

router.post("/", createApprovalRequest);
router.post("/:id/accountant-decision", accountantDecision);
router.post("/:id/manager-decision", managerDecision);

export default router;
