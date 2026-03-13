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

router.use(requireAuthIfEnabled);

router.post("/", allowRolesIfEnabled(["admin", "manager", "accountant"]), createFuelPricePeriodHandler);
router.post("/:id/close", allowRolesIfEnabled(["admin", "manager", "accountant"]), closeFuelPricePeriodHandler);
router.get("/", listFuelPricePeriodsHandler);
router.get("/:id", getFuelPricePeriodByIdHandler);
router.put("/:id", allowRolesIfEnabled(["admin", "manager", "accountant"]), updateFuelPricePeriodHandler);
router.delete("/:id", allowRolesIfEnabled(["admin", "manager"]), deleteFuelPricePeriodHandler);

export default router;
