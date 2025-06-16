import express from "express";
import passport from "passport";
import { 
  register, 
  login, 
  googleLogin, 
  getProfile, 
  updateProfile, 
  changePassword, 
  updatePreferences 
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 Autenticazione base
router.post("/register", register);
router.post("/login", login);

// ✅ Login da Google One Tap / Identity Services (POST con token)
router.post("/google-login", googleLogin);

// 🔁 Login classico via redirect Google OAuth
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

router.get("/google/callback", passport.authenticate("google", {
  successRedirect: "https://prenotazioni-online.vercel.app/dashboard",
  failureRedirect: "https://prenotazioni-online.vercel.app/login"
}));

// 🆕 ROTTE PROFILO (con authMiddleware) - QUESTE MANCAVANO!
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.put("/preferences", authMiddleware, updatePreferences);

export default router;