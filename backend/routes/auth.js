import express from "express";
import { register, login, googleLogin } from "../controllers/authController.js";

const router = express.Router();

// 🔐 Login classico
router.post("/register", register);
router.post("/login", login);

// ✅ Google One Tap o Google Identity Services
router.post("/google-login", googleLogin);

export default router;
