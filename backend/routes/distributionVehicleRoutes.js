import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  createDistributionVehicle,
  listDistributionVehicles,
} from "../controllers/distributionVehicleController.js";

const router = express.Router();

router.get("/", requireAuthIfEnabled, listDistributionVehicles);
router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), createDistributionVehicle);

export default router;
