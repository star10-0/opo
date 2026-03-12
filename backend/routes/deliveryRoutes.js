import express from "express";
import {
  createDelivery,
  listDeliveries,
  softDeleteDelivery,
  updateDelivery,
} from "../controllers/deliveryController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), listDeliveries);
router.post("/", roleMiddleware(["worker", "manager", "admin"]), createDelivery);
router.put("/:id", roleMiddleware(["manager", "admin"]), updateDelivery);
router.delete("/:id", roleMiddleware(["manager", "admin"]), softDeleteDelivery);

export default router;
