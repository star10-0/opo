import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  openOperationalDayHandler,
  closeOperationalDayHandler,
  listOperationalDaysHandler,
  getOperationalDayByIdHandler,
  updateOperationalDayHandler,
  deleteOperationalDayHandler,
} from "../controllers/operationalDayController.js";

const router = express.Router();

router.get("/current", requireAuthIfEnabled, listOperationalDaysHandler);
router.get("/", requireAuthIfEnabled, listOperationalDaysHandler);
router.get("/:id", requireAuthIfEnabled, getOperationalDayByIdHandler);
router.post("/open", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "worker"]), openOperationalDayHandler);
router.post("/:id/close", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), closeOperationalDayHandler);
router.put("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), updateOperationalDayHandler);
router.delete("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), deleteOperationalDayHandler);

export default router;
