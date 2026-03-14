import express from "express";
import auth from "../middleware/auth.js";
import { loginHandler, meHandler, registerHandler, selectStationHandler } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/me", auth, meHandler);
router.post("/select-station", auth, selectStationHandler);

export default router;
