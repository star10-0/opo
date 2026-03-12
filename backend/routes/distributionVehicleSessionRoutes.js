import express from "express";
import {
  closeDistributionVehicleSession,
  listDistributionVehicleSessions,
  openDistributionVehicleSession,
} from "../controllers/distributionVehicleSessionController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), listDistributionVehicleSessions);
router.post("/", roleMiddleware(["worker", "manager", "admin"]), openDistributionVehicleSession);
router.post("/:id/close", roleMiddleware(["worker", "manager", "admin"]), closeDistributionVehicleSession);

export default router;
