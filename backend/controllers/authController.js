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

// 🆕 ---- GET PROFILO UTENTE ----
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -googleId');
    
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    res.json(user);
  } catch (err) {
    console.error("❌ Get profile error:", err);
    res.status(500).json({ message: "Errore del server" });
  }
};

// 🆕 ---- AGGIORNA PROFILO UTENTE ----
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, birthDate, address, avatar, preferences } = req.body;
    const userId = req.user.userId;

    // 🛡️ Validazione base
    if (!name || !email) {
      return res.status(400).json({ message: "Nome e email sono obbligatori" });
    }

    // 📧 Controlla se email già esiste (se diversa da quella attuale)
    const currentUser = await User.findById(userId);
    if (email !== currentUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: "Email già in uso da un altro utente" });
      }
    }

    // 📱 Validazione telefono (se presente)
    if (phone && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(phone)) {
      return res.status(400).json({ message: "Formato telefono non valido" });
    }

    // 📅 Validazione data di nascita (se presente)
    if (birthDate) {
      const date = new Date(birthDate);
      const now = new Date();
      if (date > now) {
        return res.status(400).json({ message: "Data di nascita non può essere futura" });
      }
    }

    // 🔄 Aggiorna i dati
    const updatedFields = {
      name,
      email,
      ...(phone && { phone }),
      ...(birthDate && { birthDate }),
      ...(address && { address }),
      ...(avatar && { avatar }),
      ...(preferences && { preferences: { ...currentUser.preferences, ...preferences } })
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatedFields,
      { new: true, runValidators: true }
    ).select('-password -googleId');

    // 🔄 Genera nuovo token con dati aggiornati
    const newToken = jwt.sign(
      {
        userId: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      message: "Profilo aggiornato con successo", 
      user: updatedUser,
      token: newToken // Nuovo token con dati aggiornati
    });

  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ message: "Errore nell'aggiornamento del profilo" });
  }
};

// 🆕 ---- CAMBIA PASSWORD ----
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // 🛡️ Validazioni
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Password attuale e nuova sono obbligatorie" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "La nuova password deve essere di almeno 6 caratteri" });
    }

    // 👤 Trova utente
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    // 🔐 Verifica password attuale (skip per utenti Google OAuth)
    if (user.password !== "google-oauth") {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Password attuale non corretta" });
      }
    }

    // 🔄 Hash nuova password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 💾 Aggiorna password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ message: "Password cambiata con successo" });

  } catch (err) {
    console.error("❌ Change password error:", err);
    res.status(500).json({ message: "Errore nel cambio password" });
  }
};

// 🆕 ---- AGGIORNA SOLO PREFERENZE ----
export const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    // 🔄 Merge delle preferenze esistenti con quelle nuove
    const updatedPreferences = { ...user.preferences, ...preferences };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferences: updatedPreferences },
      { new: true }
    ).select('-password -googleId');

    res.json({ 
      message: "Preferenze aggiornate con successo", 
      preferences: updatedUser.preferences 
    });

  } catch (err) {
    console.error("❌ Update preferences error:", err);
    res.status(500).json({ message: "Errore nell'aggiornamento delle preferenze" });
  }
};