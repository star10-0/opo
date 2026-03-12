import express from "express";
import {
  openOperationalDayHandler,
  closeOperationalDayHandler,
  listOperationalDaysHandler,
  getOperationalDayByIdHandler,
  updateOperationalDayHandler,
  deleteOperationalDayHandler,
} from "../controllers/operationalDayController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/open", roleMiddleware(["manager", "admin"]), openOperationalDayHandler);
router.post("/:id/close", roleMiddleware(["manager", "admin"]), closeOperationalDayHandler);
router.get("/current", roleMiddleware(["worker", "accountant", "manager", "admin"]), listOperationalDaysHandler);
router.get("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), listOperationalDaysHandler);
router.get("/:id", roleMiddleware(["worker", "accountant", "manager", "admin"]), getOperationalDayByIdHandler);
router.put("/:id", roleMiddleware(["manager", "admin"]), updateOperationalDayHandler);
router.delete("/:id", roleMiddleware(["manager", "admin"]), deleteOperationalDayHandler);

export default router;
