import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  createPumpAssignmentHandler,
  lockPumpAssignmentOpeningHandler,
  closePumpAssignmentHandler,
  listPumpAssignmentsHandler,
  getPumpAssignmentByIdHandler,
  updatePumpAssignmentHandler,
  deletePumpAssignmentHandler,
} from "../controllers/pumpAssignmentController.js";

const router = express.Router();

router.get("/", requireAuthIfEnabled, listPumpAssignmentsHandler);
router.get("/:id", requireAuthIfEnabled, getPumpAssignmentByIdHandler);
router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "worker"]), createPumpAssignmentHandler);
router.post("/:id/lock-opening", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), lockPumpAssignmentOpeningHandler);
router.post("/:id/close", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "worker"]), closePumpAssignmentHandler);
router.put("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), updatePumpAssignmentHandler);
router.delete("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), deletePumpAssignmentHandler);

export default router;
