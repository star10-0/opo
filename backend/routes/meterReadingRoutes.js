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

router.get("/", requireAuthIfEnabled, listMeterReadingsHandler);
router.get("/:id", requireAuthIfEnabled, getMeterReadingByIdHandler);
router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "worker"]), createMeterReadingHandler);
router.put("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), updateMeterReadingHandler);
router.delete("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), deleteMeterReadingHandler);

export default router;
