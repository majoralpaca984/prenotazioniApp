import Appointment from '../models/Appointment.js';
import { sendConfirmationEmail } from './emailController.js'; // importa la funzione per inviare email
import User from '../models/User.js';


export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.userId });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const { title, description, date, time, status } = req.body;

    // Controlla se lo slot è già occupato
    const slotTaken = await Appointment.findOne({
      date: new Date(`${date}T${time}`),
    });

    if (slotTaken) {
      return res.status(400).json({ message: "Slot già occupato!" });
    }

    // Crea nuovo appuntamento
    const appointment = new Appointment({
      title,
      description,
      date: new Date(`${date}T${time}`),
      time,
      status,
      user: req.user.userId,
    });

    await appointment.save();

    // Recupera email utente (dal token oppure dal DB)
    let userEmail = req.user.email;
    if (!userEmail) {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ message: "Utente non trovato" });
      userEmail = user.email;
    }

    // Invia email di conferma
    await sendConfirmationEmail(userEmail, {
      date,
      time,
      doctor: appointment.title, // o "Medico" se preferisci
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error("Errore creazione appuntamento:", err);
    res.status(500).json({ message: "Errore creazione appuntamento" });
  }
};



export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// Update by ID
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete by ID

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


