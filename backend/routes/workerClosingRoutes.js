import express from "express";
import {
  createWorkerClosing,
  listWorkerClosings,
  submitWorkerClosing,
} from "../controllers/workerClosingController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), listWorkerClosings);
router.post("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), createWorkerClosing);
router.post("/:id/submit", roleMiddleware(["worker", "accountant", "manager", "admin"]), submitWorkerClosing);

export default router;
