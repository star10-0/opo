import express from "express";
import { requireAuthIfEnabled } from "../middleware/accessControl.js";
import { generateSalesLedger, listSalesLedger } from "../controllers/salesLedgerController.js";

const router = express.Router();

router.use(requireAuthIfEnabled);

router.get("/", listSalesLedger);
router.post("/generate", generateSalesLedger);

export default router;
