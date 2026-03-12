import express from "express";
import {
  createMeterReadingHandler,
  listMeterReadingsHandler,
  getMeterReadingByIdHandler,
  updateMeterReadingHandler,
  deleteMeterReadingHandler,
} from "../controllers/meterReadingController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", roleMiddleware(["worker", "manager", "admin"]), createMeterReadingHandler);
router.get("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), listMeterReadingsHandler);
router.get("/:id", roleMiddleware(["worker", "accountant", "manager", "admin"]), getMeterReadingByIdHandler);
router.put("/:id", roleMiddleware(["manager", "admin"]), updateMeterReadingHandler);
router.delete("/:id", roleMiddleware(["manager", "admin"]), deleteMeterReadingHandler);

export default router;
