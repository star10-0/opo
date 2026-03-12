import express from "express";
import {
  createDistributionVehicle,
  listDistributionVehicles,
} from "../controllers/distributionVehicleController.js";

const router = express.Router();

router.get("/", listDistributionVehicles);
router.post("/", createDistributionVehicle);

export default router;
