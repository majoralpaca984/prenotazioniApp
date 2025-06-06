import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// Classici POST
router.post("/register", register);
router.post("/login", login);

// âœ… Google OAuth Redirect Flow
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account"
}));

router.get("/google/callback", passport.authenticate("google", {
  successRedirect: "https://prenotazioni-app.vercel.app",
  failureRedirect: "https://prenotazioni-app.vercel.app/login"
}));

export default router;
