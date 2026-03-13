import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import { createShiftExpense, listShiftExpenses } from "../controllers/shiftExpenseController.js";

const router = express.Router();

router.use(requireAuthIfEnabled);

router.get("/", listShiftExpenses);
router.post("/", allowRolesIfEnabled(["admin", "manager", "worker"]), createShiftExpense);

export default router;
