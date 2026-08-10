import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import appointmentRoutes from "./routes/appointments.js";
import authRoutes from "./routes/auth.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const defaultOrigins = [
  "https://prenotazioni-app.vercel.app",
  "https://prenotazioni-online.vercel.app",
  "http://localhost:5173",
];
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : defaultOrigins;

app.disable("x-powered-by");
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "100kb" }));

app.get("/ping", (req, res) => res.json({ message: "pong" }));
app.use("/auth", authRoutes);
app.use("/appointments", appointmentRoutes);

app.use((req, res) => res.status(404).json({ message: "Risorsa non trovata" }));
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ message: "Errore del server" });
});

async function startServer() {
  if (!process.env.MONGO_URL || !process.env.JWT_SECRET) {
    throw new Error("MONGO_URL e JWT_SECRET sono obbligatori");
  }

  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => console.log(`Backend attivo sulla porta ${port}`));
}

startServer().catch((error) => {
  console.error("Avvio non riuscito:", error.message);
  process.exit(1);
});

export default app;
