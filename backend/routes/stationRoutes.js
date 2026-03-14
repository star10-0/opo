import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import { bootstrapStationHandler, createStation, getStationCustomizationHandler, listAllowedStations, listStations, updateStationCustomizationHandler } from "../controllers/stationController.js";

const router = express.Router();

router.get("/", requireAuthIfEnabled, listStations);
router.get("/allowed", requireAuthIfEnabled, listAllowedStations);
router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), createStation);
router.post("/bootstrap", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), bootstrapStationHandler);
router.get("/:stationId/customization", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), getStationCustomizationHandler);
router.patch("/:stationId/customization", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), updateStationCustomizationHandler);
router.put("/:stationId/customization", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), updateStationCustomizationHandler);

export default router;
