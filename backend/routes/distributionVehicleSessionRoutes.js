import express from "express";
import {
  closeDistributionVehicleSession,
  openDistributionVehicleSession,
} from "../controllers/distributionVehicleSessionController.js";

const router = express.Router();

router.post("/", openDistributionVehicleSession);
router.post("/:id/close", closeDistributionVehicleSession);

export default router;
