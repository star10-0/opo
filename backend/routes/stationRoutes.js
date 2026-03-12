import express from "express";
import { createStation, listStations } from "../controllers/stationController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), listStations);
router.post("/", roleMiddleware(["manager", "admin"]), createStation);

export default router;
