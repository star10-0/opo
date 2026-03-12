import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import { generateSalesLedger, listSalesLedger } from "../controllers/salesLedgerController.js";

const router = express.Router();

router.get("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), listSalesLedger);
router.post("/generate", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), generateSalesLedger);

export default router;
