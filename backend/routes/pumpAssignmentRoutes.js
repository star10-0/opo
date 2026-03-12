import express from "express";
import { requireAuthIfEnabled } from "../middleware/accessControl.js";
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

router.post("/", createPumpAssignmentHandler);
router.post("/:id/lock-opening", lockPumpAssignmentOpeningHandler);
router.post("/:id/close", closePumpAssignmentHandler);
router.get("/", listPumpAssignmentsHandler);
router.get("/:id", getPumpAssignmentByIdHandler);
router.put("/:id", updatePumpAssignmentHandler);
router.delete("/:id", deletePumpAssignmentHandler);

export default router;
