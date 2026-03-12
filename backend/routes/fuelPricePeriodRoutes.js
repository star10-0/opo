import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  createFuelPricePeriodHandler,
  closeFuelPricePeriodHandler,
  listFuelPricePeriodsHandler,
  getFuelPricePeriodByIdHandler,
  updateFuelPricePeriodHandler,
  deleteFuelPricePeriodHandler,
} from "../controllers/fuelPricePeriodController.js";

const router = express.Router();

router.get("/", requireAuthIfEnabled, listFuelPricePeriodsHandler);
router.get("/:id", requireAuthIfEnabled, getFuelPricePeriodByIdHandler);
router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), createFuelPricePeriodHandler);
router.post("/:id/close", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), closeFuelPricePeriodHandler);
router.put("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), updateFuelPricePeriodHandler);
router.delete("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), deleteFuelPricePeriodHandler);

export default router;
