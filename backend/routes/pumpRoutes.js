import express from "express";
import { allowRolesIfEnabled, requireAuthIfEnabled } from "../middleware/accessControl.js";
import {
  createPumpHandler,
  listPumpsHandler,
  getPumpByIdHandler,
  updatePumpHandler,
  deletePumpHandler,
} from "../controllers/pumpController.js";

const router = express.Router();

router.use(requireAuthIfEnabled);

router.post("/", allowRolesIfEnabled(["admin", "manager"]), createPumpHandler);
router.get("/", listPumpsHandler);
router.get("/:id", getPumpByIdHandler);
router.put("/:id", allowRolesIfEnabled(["admin", "manager"]), updatePumpHandler);
router.delete("/:id", allowRolesIfEnabled(["admin", "manager"]), deletePumpHandler);

export default router;
