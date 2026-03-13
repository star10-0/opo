import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  closeDistributionVehicleSession,
  listDistributionVehicleSessions,
  openDistributionVehicleSession,
} from "../controllers/distributionVehicleSessionController.js";

const router = express.Router();

router.use(requireAuthIfEnabled);

router.get("/", listDistributionVehicleSessions);
router.post("/", allowRolesIfEnabled(["admin", "manager", "worker"]), openDistributionVehicleSession);
router.post("/:id/close", allowRolesIfEnabled(["admin", "manager", "worker"]), closeDistributionVehicleSession);

export default router;
