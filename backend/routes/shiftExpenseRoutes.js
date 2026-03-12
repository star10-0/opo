import express from "express";
import { requireAuthIfEnabled } from "../middleware/accessControl.js";
import { createShiftExpense, listShiftExpenses } from "../controllers/shiftExpenseController.js";

const router = express.Router();

router.use(requireAuthIfEnabled);

router.get("/", listShiftExpenses);
router.post("/", createShiftExpense);

export default router;
