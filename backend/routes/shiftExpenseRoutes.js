import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import { createShiftExpense, listShiftExpenses } from "../controllers/shiftExpenseController.js";

const router = express.Router();

router.get("/", requireAuthIfEnabled, listShiftExpenses);
router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "worker"]), createShiftExpense);

export default router;
