import express from "express";
import { requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  createMeterReadingHandler,
  listMeterReadingsHandler,
  getMeterReadingByIdHandler,
  updateMeterReadingHandler,
  deleteMeterReadingHandler,
} from "../controllers/meterReadingController.js";

const router = express.Router();

router.use(requireAuthIfEnabled);

router.post("/", createMeterReadingHandler);
router.get("/", listMeterReadingsHandler);
router.get("/:id", getMeterReadingByIdHandler);
router.put("/:id", updateMeterReadingHandler);
router.delete("/:id", deleteMeterReadingHandler);

export default router;
