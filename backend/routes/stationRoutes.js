import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import { bootstrapStationHandler, createStation, listAllowedStations, listStations } from "../controllers/stationController.js";

const router = express.Router();

router.get("/", requireAuthIfEnabled, listStations);
router.get("/allowed", requireAuthIfEnabled, listAllowedStations);
router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), createStation);
router.post("/bootstrap", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), bootstrapStationHandler);

export default router;
