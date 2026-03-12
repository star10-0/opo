import express from "express";
import { requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  closeDistributionVehicleSession,
  listDistributionVehicleSessions,
  openDistributionVehicleSession,
} from "../controllers/distributionVehicleSessionController.js";

const router = express.Router();

router.use(requireAuthIfEnabled);

router.get("/", listDistributionVehicleSessions);
router.post("/", openDistributionVehicleSession);
router.post("/:id/close", closeDistributionVehicleSession);

export default router;
