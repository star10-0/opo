import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  createWorkerClosing,
  listWorkerClosings,
  submitWorkerClosing,
} from "../controllers/workerClosingController.js";

const router = express.Router();

router.get("/", requireAuthIfEnabled, listWorkerClosings);
router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "worker"]), createWorkerClosing);
router.post("/:id/submit", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "worker"]), submitWorkerClosing);

export default router;
