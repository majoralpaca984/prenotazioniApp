import express from "express";
import passport from "passport";
import { register, login, googleLogin } from "../controllers/authController.js";

const router = express.Router();

// 🔐 Login classico
router.post("/register", register);
router.post("/login", login);

// ✅ Login da Google One Tap / Identity Services (POST con token)
router.post("/google-login", googleLogin);

// 🔁 Login classico via redirect Google OAuth
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

router.get("/google/callback", passport.authenticate("google", {
  successRedirect: "https://prenotazioni-app.vercel.app/dashboard",
  failureRedirect: "https://prenotazioni-app.vercel.app/login"
}));

export default router;
