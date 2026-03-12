import express from "express";
import {
  createFuelPricePeriodHandler,
  closeFuelPricePeriodHandler,
  listFuelPricePeriodsHandler,
  getFuelPricePeriodByIdHandler,
  updateFuelPricePeriodHandler,
  deleteFuelPricePeriodHandler,
} from "../controllers/fuelPricePeriodController.js";

const router = express.Router();

router.post("/", createFuelPricePeriodHandler);
router.post("/:id/close", closeFuelPricePeriodHandler);
router.get("/", listFuelPricePeriodsHandler);
router.get("/:id", getFuelPricePeriodByIdHandler);
router.put("/:id", updateFuelPricePeriodHandler);
router.delete("/:id", deleteFuelPricePeriodHandler);

export default router;
