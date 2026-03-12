import express from "express";
import {
  createWorkerClosing,
  listWorkerClosings,
  submitWorkerClosing,
} from "../controllers/workerClosingController.js";

const router = express.Router();

router.get("/", listWorkerClosings);
router.post("/", createWorkerClosing);
router.post("/:id/submit", submitWorkerClosing);

export default router;
