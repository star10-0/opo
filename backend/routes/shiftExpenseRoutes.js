import express from "express";
import { createShiftExpense, listShiftExpenses } from "../controllers/shiftExpenseController.js";

const router = express.Router();

router.get("/", listShiftExpenses);
router.post("/", createShiftExpense);

export default router;
