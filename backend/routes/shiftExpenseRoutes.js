import express from "express";
import { createShiftExpense, listShiftExpenses } from "../controllers/shiftExpenseController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), listShiftExpenses);
router.post("/", roleMiddleware(["worker", "manager", "admin"]), createShiftExpense);

export default router;
