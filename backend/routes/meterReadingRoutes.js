import express from "express";
import {
  createMeterReadingHandler,
  listMeterReadingsHandler,
  getMeterReadingByIdHandler,
  updateMeterReadingHandler,
  deleteMeterReadingHandler,
} from "../controllers/meterReadingController.js";

const router = express.Router();

router.post("/", createMeterReadingHandler);
router.get("/", listMeterReadingsHandler);
router.get("/:id", getMeterReadingByIdHandler);
router.put("/:id", updateMeterReadingHandler);
router.delete("/:id", deleteMeterReadingHandler);

export default router;
