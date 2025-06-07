import express from "express";
import Doctor from "../models/Doctor.js";

const router = express.Router();

// @route   GET /doctors?speciality=ecografia
// @desc    Ottieni tutti i medici, filtrando per specialità (opzionale)
router.get("/", async (req, res) => {
  try {
    const { speciality } = req.query;

    // Se c'è una specialità, filtriamo in modo case-insensitive
    const filter = speciality
      ? { speciality: { $regex: new RegExp(speciality, "i") } }
      : {};

    const doctors = await Doctor.find(filter);

    // Se vuoto, restituisce 200 comunque (vuoto è valido)
    res.status(200).json(doctors);
  } catch (error) {
    console.error("❌ Errore durante la ricerca dei medici:", error);
    res.status(500).json({
      error: "Errore del server durante il recupero dei medici",
      details: error.message,
    });
  }
});

export default router;
