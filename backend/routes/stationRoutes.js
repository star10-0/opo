import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import { createStation, listStations } from "../controllers/stationController.js";

const router = express.Router();

router.get("/", requireAuthIfEnabled, listStations);
router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), createStation);

export default router;
