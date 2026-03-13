import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  createMeterReadingHandler,
  listMeterReadingsHandler,
  getMeterReadingByIdHandler,
  updateMeterReadingHandler,
  deleteMeterReadingHandler,
} from "../controllers/meterReadingController.js";

const router = express.Router();

router.use(requireAuthIfEnabled);

router.post("/", allowRolesIfEnabled(["admin", "manager", "worker"]), createMeterReadingHandler);
router.get("/", listMeterReadingsHandler);
router.get("/:id", getMeterReadingByIdHandler);
router.put("/:id", allowRolesIfEnabled(["admin", "manager", "worker"]), updateMeterReadingHandler);
router.delete("/:id", allowRolesIfEnabled(["admin", "manager"]), deleteMeterReadingHandler);

export default router;
