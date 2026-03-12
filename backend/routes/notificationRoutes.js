import express from "express";
import { requireAuthIfEnabled } from "../middleware/accessControl.js";
import { listNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.use(requireAuthIfEnabled);
router.get("/", listNotifications);
export default router;
