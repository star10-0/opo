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

router.get("/", requireAuthIfEnabled, listPumpsHandler);
router.get("/:id", requireAuthIfEnabled, getPumpByIdHandler);
router.post("/", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), createPumpHandler);
router.put("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), updatePumpHandler);
router.delete("/:id", requireAuthIfEnabled, allowRolesIfEnabled(["admin", "manager"]), deletePumpHandler);

export default router;
