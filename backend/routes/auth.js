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
import jwt from "jsonwebtoken";

const router = express.Router();

//  Autenticazione base
router.post("/register", register);
router.post("/login", login);

//  Login da Google One Tap (POST con token) — flusso principale
router.post("/google-login", googleLogin);

//  Login classico via redirect Google OAuth (backup)
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

router.get("/google/callback", passport.authenticate("google", {
  failureRedirect: "https://prenotazioni-online.vercel.app/login"
}), (req, res) => {
  // Dopo il login Passport, genera un JWT e redirect al frontend con il token
  const user = req.user;
  const token = jwt.sign(
    {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.redirect(`https://prenotazioni-online.vercel.app/auth/callback?token=${token}`);
});

//  ROTTE PROFILO
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.put("/preferences", authMiddleware, updatePreferences);

export default router;
