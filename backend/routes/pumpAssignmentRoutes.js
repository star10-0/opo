import express from "express";
import {
  createPumpAssignmentHandler,
  lockPumpAssignmentOpeningHandler,
  closePumpAssignmentHandler,
  listPumpAssignmentsHandler,
  getPumpAssignmentByIdHandler,
  updatePumpAssignmentHandler,
  deletePumpAssignmentHandler,
} from "../controllers/pumpAssignmentController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", roleMiddleware(["worker", "manager", "admin"]), createPumpAssignmentHandler);
router.post("/:id/lock-opening", roleMiddleware(["worker", "manager", "admin"]), lockPumpAssignmentOpeningHandler);
router.post("/:id/close", roleMiddleware(["worker", "manager", "admin"]), closePumpAssignmentHandler);
router.get("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), listPumpAssignmentsHandler);
router.get("/:id", roleMiddleware(["worker", "accountant", "manager", "admin"]), getPumpAssignmentByIdHandler);
router.put("/:id", roleMiddleware(["manager", "admin"]), updatePumpAssignmentHandler);
router.delete("/:id", roleMiddleware(["manager", "admin"]), deletePumpAssignmentHandler);

export default router;
