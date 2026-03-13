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

router.use(requireAuthIfEnabled);

router.post("/open", allowRolesIfEnabled(["admin", "manager"]), openOperationalDayHandler);
router.post("/:id/close", allowRolesIfEnabled(["admin", "manager", "accountant"]), closeOperationalDayHandler);
router.get("/current", listOperationalDaysHandler);
router.get("/", listOperationalDaysHandler);
router.get("/:id", getOperationalDayByIdHandler);
router.put("/:id", allowRolesIfEnabled(["admin", "manager"]), updateOperationalDayHandler);
router.delete("/:id", allowRolesIfEnabled(["admin", "manager"]), deleteOperationalDayHandler);

export default router;
