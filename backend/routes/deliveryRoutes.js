import express from "express";
import {
  createDelivery,
  listDeliveries,
  softDeleteDelivery,
  updateDelivery,
} from "../controllers/deliveryController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", listDeliveries);
router.post("/", roleMiddleware(["admin", "accountant", "worker"]), createDelivery);
router.put("/:id", roleMiddleware(["admin", "accountant"]), updateDelivery);
router.delete("/:id", roleMiddleware(["admin", "accountant"]), softDeleteDelivery);

export default router;
