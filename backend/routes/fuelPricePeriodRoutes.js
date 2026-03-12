import express from "express";
import { requireAuthIfEnabled } from "../middleware/accessControl.js";
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

router.post("/", createFuelPricePeriodHandler);
router.post("/:id/close", closeFuelPricePeriodHandler);
router.get("/", listFuelPricePeriodsHandler);
router.get("/:id", getFuelPricePeriodByIdHandler);
router.put("/:id", updateFuelPricePeriodHandler);
router.delete("/:id", deleteFuelPricePeriodHandler);

export default router;
