import express from "express";
import {
  createFuelPricePeriodHandler,
  closeFuelPricePeriodHandler,
  listFuelPricePeriodsHandler,
  getFuelPricePeriodByIdHandler,
  updateFuelPricePeriodHandler,
  deleteFuelPricePeriodHandler,
} from "../controllers/fuelPricePeriodController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", roleMiddleware(["manager", "admin"]), createFuelPricePeriodHandler);
router.post("/:id/close", roleMiddleware(["manager", "admin"]), closeFuelPricePeriodHandler);
router.get("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), listFuelPricePeriodsHandler);
router.get("/:id", roleMiddleware(["worker", "accountant", "manager", "admin"]), getFuelPricePeriodByIdHandler);
router.put("/:id", roleMiddleware(["manager", "admin"]), updateFuelPricePeriodHandler);
router.delete("/:id", roleMiddleware(["manager", "admin"]), deleteFuelPricePeriodHandler);

export default router;
