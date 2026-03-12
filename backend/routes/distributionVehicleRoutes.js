import express from "express";
import { requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  createDistributionVehicle,
  listDistributionVehicles,
} from "../controllers/distributionVehicleController.js";

const router = express.Router();

router.use(requireAuthIfEnabled);

router.get("/", listDistributionVehicles);
router.post("/", createDistributionVehicle);

export default router;
