import express from "express";
import {
  createDelivery,
  listDeliveries,
  softDeleteDelivery,
  updateDelivery,
} from "../controllers/deliveryController.js";

const router = express.Router();

router.get("/", listDeliveries);
router.post("/", createDelivery);
router.put("/:id", updateDelivery);
router.delete("/:id", softDeleteDelivery);

export default router;
