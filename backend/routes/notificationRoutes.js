import express from "express";
import { listNotifications } from "../controllers/notificationController.js";

const router = express.Router();
router.get("/", listNotifications);
export default router;
