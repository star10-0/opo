import express from "express";
import { createStation, listStations } from "../controllers/stationController.js";

const router = express.Router();

router.get("/", listStations);
router.post("/", createStation);

export default router;
