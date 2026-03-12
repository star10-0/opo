import express from "express";
import { requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  createPumpHandler,
  listPumpsHandler,
  getPumpByIdHandler,
  updatePumpHandler,
  deletePumpHandler,
} from "../controllers/pumpController.js";

const router = express.Router();

router.use(requireAuthIfEnabled);

router.post("/", createPumpHandler);
router.get("/", listPumpsHandler);
router.get("/:id", getPumpByIdHandler);
router.put("/:id", updatePumpHandler);
router.delete("/:id", deletePumpHandler);

export default router;
