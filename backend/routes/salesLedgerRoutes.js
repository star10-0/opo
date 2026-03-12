import express from "express";
import { generateSalesLedger, listSalesLedger } from "../controllers/salesLedgerController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", roleMiddleware(["accountant", "manager", "admin"]), listSalesLedger);
router.post("/generate", roleMiddleware(["accountant", "manager", "admin"]), generateSalesLedger);

export default router;
