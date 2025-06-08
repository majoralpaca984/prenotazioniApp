import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ---- GOOGLE LOGIN ----
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.given_name,
        email: payload.email,
        password: "google-oauth",
        avatar: payload.picture,
        role: "user",
      });
    }

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

    res.json({ token });
  } catch (err) {
    console.error("Google login error", err);
    res.status(401).json({ message: "Google login failed" });
  }
};

// ---- LOGIN CLASSICO ----
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(401).json({ message: "Credenziali non valide" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Credenziali non valide" });

  const token = jwt.sign(
    {
      userId: user._id,
      name: user.name,             
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
};

// ---- REGISTER ----
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "Tutti i campi sono obbligatori" });
  }

  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "Email già registrata" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({ name, email, password: hashedPassword });

  res.status(201).json({ message: "Registrazione ok!" });
};
