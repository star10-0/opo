import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import { listNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.use(requireAuthIfEnabled);
router.get("/", allowRolesIfEnabled(["admin", "manager", "accountant", "worker"]), listNotifications);

export default router;
