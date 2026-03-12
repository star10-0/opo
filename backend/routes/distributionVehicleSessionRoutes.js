import express from "express";
import {
  closeDistributionVehicleSession,
  listDistributionVehicleSessions,
  openDistributionVehicleSession,
} from "../controllers/distributionVehicleSessionController.js";

const router = express.Router();

router.get("/", listDistributionVehicleSessions);
router.post("/", openDistributionVehicleSession);
router.post("/:id/close", closeDistributionVehicleSession);

export default router;
