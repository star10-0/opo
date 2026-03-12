import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  createDelivery,
  listDeliveries,
  softDeleteDelivery,
  updateDelivery,
} from "../controllers/deliveryController.js";

const router = express.Router();

router.get("/", requireAuthIfEnabled, listDeliveries);
router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "worker"]), createDelivery);
router.put("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager", "accountant"]), updateDelivery);
router.delete("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), softDeleteDelivery);

export default router;
