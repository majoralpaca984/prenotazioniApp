import "dotenv/config";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const createToken = (user) =>
  jwt.sign(
    { userId: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

const publicUserFields = "-password -googleId";

export async function googleLogin(req, res) {
  try {
    if (!req.body.credential || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ message: "Credenziali Google mancanti" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = normalizeEmail(payload.email);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: payload.name || payload.given_name || "Utente",
        email,
        googleId: payload.sub,
        avatar: payload.picture || "",
      });
    } else {
      if (!user.googleId) user.googleId = payload.sub;
      if (!user.avatar && payload.picture) user.avatar = payload.picture;
      await user.save();
    }

    return res.json({ token: createToken(user) });
  } catch (error) {
    console.error("Google login error:", error.message);
    return res.status(401).json({ message: "Accesso con Google non riuscito" });
  }
}

export async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email e password sono obbligatorie" });
    }

    const user = await User.findOne({ email });
    if (!user?.password || user.password === "google-oauth") {
      return res.status(401).json({ message: "Usa l'accesso con Google per questo account" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Credenziali non valide" });
    }

    return res.json({ token: createToken(user) });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Errore durante l'accesso" });
  }
}

export async function register(req, res) {
  try {
    const name = req.body.name?.trim();
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Tutti i campi sono obbligatori" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "La password deve contenere almeno 8 caratteri" });
    }
    if (await User.exists({ email })) {
      return res.status(409).json({ message: "Email già registrata" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({ name, email, password: hashedPassword });
    return res.status(201).json({ message: "Registrazione completata" });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ message: "Errore durante la registrazione" });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId).select(publicUserFields).lean();
    if (!user) return res.status(404).json({ message: "Utente non trovato" });
    return res.json(user);
  } catch (error) {
    console.error("Get profile error:", error.message);
    return res.status(500).json({ message: "Errore nel caricamento del profilo" });
  }
}

export async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "Utente non trovato" });

    const name = req.body.name?.trim();
    const email = normalizeEmail(req.body.email);
    const phone = req.body.phone?.trim() || "";
    const address = req.body.address?.trim() || "";
    const avatar = req.body.avatar?.trim() || "";

    if (!name || !email) {
      return res.status(400).json({ message: "Nome e email sono obbligatori" });
    }
    if (phone && !/^\+?[0-9\s()-]{8,}$/.test(phone)) {
      return res.status(400).json({ message: "Formato telefono non valido" });
    }
    if (avatar && !/^https?:\/\//i.test(avatar)) {
      return res.status(400).json({ message: "L'immagine profilo deve essere un URL valido" });
    }
    if (email !== user.email && await User.exists({ email, _id: { $ne: user._id } })) {
      return res.status(409).json({ message: "Email già in uso" });
    }

    const birthDate = req.body.birthDate ? new Date(req.body.birthDate) : null;
    if (birthDate && (Number.isNaN(birthDate.getTime()) || birthDate > new Date())) {
      return res.status(400).json({ message: "Data di nascita non valida" });
    }

    Object.assign(user, { name, email, phone, address, avatar, birthDate });
    await user.save();

    const safeUser = await User.findById(user._id).select(publicUserFields).lean();
    return res.json({ message: "Profilo aggiornato", user: safeUser, token: createToken(user) });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({ message: "Errore nell'aggiornamento del profilo" });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword = "", newPassword = "" } = req.body;
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "La nuova password deve contenere almeno 8 caratteri" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "Utente non trovato" });

    const hasEmailPassword = user.password && user.password !== "google-oauth";
    if (hasEmailPassword) {
      const passwordMatches = currentPassword && await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatches) {
        return res.status(400).json({ message: "Password attuale non corretta" });
      }
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return res.json({ message: "Password aggiornata" });
  } catch (error) {
    console.error("Change password error:", error.message);
    return res.status(500).json({ message: "Errore nel cambio password" });
  }
}
