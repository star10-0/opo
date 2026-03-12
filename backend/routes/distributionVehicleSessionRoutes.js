import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  closeDistributionVehicleSession,
  listDistributionVehicleSessions,
  openDistributionVehicleSession,
} from "../controllers/distributionVehicleSessionController.js";

const router = express.Router();

router.get("/", requireAuthIfEnabled, listDistributionVehicleSessions);
router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "worker"]), openDistributionVehicleSession);
router.post("/:id/close", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "worker"]), closeDistributionVehicleSession);

export default router;
