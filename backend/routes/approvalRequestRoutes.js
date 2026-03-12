import express from "express";
import {
  accountantDecision,
  createApprovalRequest,
  listApprovalRequests,
  managerDecision,
} from "../controllers/approvalController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", roleMiddleware(["admin", "accountant"]), listApprovalRequests);
router.post("/", createApprovalRequest);
router.post("/:id/accountant-decision", roleMiddleware(["accountant"]), accountantDecision);
router.post("/:id/manager-decision", roleMiddleware(["admin"]), managerDecision);

export default router;
