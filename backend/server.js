import express from "express";
import passport from "passport";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Importa le routes
import "./config/passport.js"; // Configurazione Passport per Google OAuth
import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointments.js";
import doctorRoutes from "./routes/doctors.js"; 

// Path assoluto della cartella backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica .env
dotenv.config({ path: join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 4000;

// CORS: consenti chiamate da Vercel e localhost per sviluppo
app.use(
  cors({
    origin: ["https://prenotazioni-app.vercel.app", "http://localhost:5173"],
    credentials: true,
  })
);

// Middleware per body JSON
app.use(express.json());

// ✅ Registra tutte le rotte
app.use("/auth", authRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/doctors", doctorRoutes); 

// Rotta di test
app.get("/ping", (req, res) => res.json({ message: "pong!" }));

// Connessione a MongoDB + avvio server
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
