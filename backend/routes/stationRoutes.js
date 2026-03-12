import express from "express";
import { createStation, listStations } from "../controllers/stationController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", listStations);
router.post("/", roleMiddleware(["admin"]), createStation);

export default router;
