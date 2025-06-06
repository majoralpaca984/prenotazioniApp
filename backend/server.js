import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointments.js";

// 🟢 Calcola il path assoluto della cartella backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🟢 Forza il path completo del file .env
dotenv.config({ path: join(__dirname, ".env") });

// ⬇️ Avvio server
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/appointments", appointmentRoutes);

app.get("/ping", (req, res) => res.json({ message: "pong!" }));

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
