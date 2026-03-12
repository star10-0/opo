import express from "express";
import { listNotifications } from "../controllers/notificationController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();
router.get("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), listNotifications);
export default router;
