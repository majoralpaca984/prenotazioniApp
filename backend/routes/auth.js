import express from "express";
import {
  register,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  changePassword
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

//  Autenticazione base
router.post("/register", register);
router.post("/login", login);

//  Login da Google One Tap (POST con token) — flusso principale
router.post("/google-login", googleLogin);

//  ROTTE PROFILO
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

export default router;
