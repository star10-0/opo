import express from "express";
import {
  createDistributionVehicle,
  listDistributionVehicles,
} from "../controllers/distributionVehicleController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), listDistributionVehicles);
router.post("/", roleMiddleware(["manager", "admin"]), createDistributionVehicle);

export default router;
