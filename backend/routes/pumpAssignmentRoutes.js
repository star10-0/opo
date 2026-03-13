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

router.use(requireAuthIfEnabled);

router.post("/", allowRolesIfEnabled(["admin", "manager"]), createPumpAssignmentHandler);
router.post("/:id/lock-opening", allowRolesIfEnabled(["admin", "manager", "accountant"]), lockPumpAssignmentOpeningHandler);
router.post("/:id/close", allowRolesIfEnabled(["admin", "manager", "worker"]), closePumpAssignmentHandler);
router.get("/", listPumpAssignmentsHandler);
router.get("/:id", getPumpAssignmentByIdHandler);
router.put("/:id", allowRolesIfEnabled(["admin", "manager"]), updatePumpAssignmentHandler);
router.delete("/:id", allowRolesIfEnabled(["admin", "manager"]), deletePumpAssignmentHandler);

export default router;
