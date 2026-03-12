import express from "express";
import {
  accountantDecision,
  createApprovalRequest,
  listApprovalRequests,
  managerDecision,
} from "../controllers/approvalController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), listApprovalRequests);
router.post("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), createApprovalRequest);
router.post("/:id/accountant-decision", roleMiddleware(["accountant", "admin"]), accountantDecision);
router.post("/:id/manager-decision", roleMiddleware(["manager", "admin"]), managerDecision);

export default router;
