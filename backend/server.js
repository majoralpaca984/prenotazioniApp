import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";


import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointments.js";

//  Calcola il path assoluto della cartella backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Forza il path completo del file .env
dotenv.config({ path: join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configurato correttamente per accettare richieste da Vercel
app.use(
  cors({
    origin: "https://prenotazioni-app.vercel.app", 
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/appointments", appointmentRoutes);

app.get("/ping", (req, res) => res.json({ message: "pong!" }));

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ðŸš€ Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("âŒ MongoDB connection error:", err);
  });