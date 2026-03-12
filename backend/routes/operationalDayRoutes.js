import express from "express";
import {
  openOperationalDayHandler,
  closeOperationalDayHandler,
  listOperationalDaysHandler,
  getOperationalDayByIdHandler,
  updateOperationalDayHandler,
  deleteOperationalDayHandler,
} from "../controllers/operationalDayController.js";

const router = express.Router();

router.post("/open", openOperationalDayHandler);
router.post("/:id/close", closeOperationalDayHandler);
router.get("/", listOperationalDaysHandler);
router.get("/:id", getOperationalDayByIdHandler);
router.put("/:id", updateOperationalDayHandler);
router.delete("/:id", deleteOperationalDayHandler);

export default router;
