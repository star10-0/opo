import express from "express";
import {
  createPumpHandler,
  listPumpsHandler,
  getPumpByIdHandler,
  updatePumpHandler,
  deletePumpHandler,
} from "../controllers/pumpController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", roleMiddleware(["manager", "admin"]), createPumpHandler);
router.get("/", roleMiddleware(["worker", "accountant", "manager", "admin"]), listPumpsHandler);
router.get("/:id", roleMiddleware(["worker", "accountant", "manager", "admin"]), getPumpByIdHandler);
router.put("/:id", roleMiddleware(["manager", "admin"]), updatePumpHandler);
router.delete("/:id", roleMiddleware(["manager", "admin"]), deletePumpHandler);

export default router;
