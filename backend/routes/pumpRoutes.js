import express from "express";
import {
  createPumpHandler,
  listPumpsHandler,
  getPumpByIdHandler,
  updatePumpHandler,
  deletePumpHandler,
} from "../controllers/pumpController.js";

const router = express.Router();

router.post("/", createPumpHandler);
router.get("/", listPumpsHandler);
router.get("/:id", getPumpByIdHandler);
router.put("/:id", updatePumpHandler);
router.delete("/:id", deletePumpHandler);

export default router;
