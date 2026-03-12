import express from "express";
import { generateSalesLedger, listSalesLedger } from "../controllers/salesLedgerController.js";

const router = express.Router();

router.get("/", listSalesLedger);
router.post("/generate", generateSalesLedger);

export default router;
