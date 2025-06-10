import Appointment from '../models/Appointment.js';
import { sendConfirmationEmail } from './emailController.js'; 
import User from '../models/User.js';

// 🚀 CACHE SEMPLICE per velocizzare le chiamate
const cache = new Map();
const CACHE_TIME = 3 * 60 * 1000; // 3 minuti

export const getAppointments = async (req, res) => {
  try {
    // Controlla se abbiamo già i dati in cache
    const cacheKey = `appointments_${req.user.userId}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.time < CACHE_TIME) {
      return res.json(cached.data);
    }

    // 📈 Query ottimizzata: ordina per data e usa .lean() per performance
    const appointments = await Appointment
      .find({ user: req.user.userId })
      .sort({ date: 1 })
      .lean(); // 40% più veloce!

    // Salva in cache
    cache.set(cacheKey, {
      data: appointments,
      time: Date.now()
    });

    res.json(appointments);
  } catch (err) {
    console.error('❌ Error fetching appointments:', err);
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const { title, description, date, time, status } = req.body;

    // 🛡️ Validazione migliorata
    if (!title || !date || !time) {
      return res.status(400).json({ message: "Titolo, data e ora sono obbligatori" });
    }

    const appointmentDate = new Date(`${date}T${time}`);
    
    // Controlla che la data non sia nel passato
    if (appointmentDate < new Date()) {
      return res.status(400).json({ message: "Non puoi prenotare nel passato" });
    }

    // Controlla se lo slot è già occupato (ottimizzato)
    const slotTaken = await Appointment.findOne({
      date: appointmentDate,
      status: { $ne: 'cancelled' } // Ignora appuntamenti cancellati
    }).lean();

    if (slotTaken) {
      return res.status(400).json({ message: "Slot già occupato!" });
    }

    // Crea nuovo appuntamento
    const appointment = new Appointment({
      title,
      description,
      date: appointmentDate,
      time,
      status: status || 'scheduled', // Default se non specificato
      user: req.user.userId,
    });

    await appointment.save();

    // 🗑️ Pulisci cache quando crei nuovo appuntamento
    cache.delete(`appointments_${req.user.userId}`);

    // Recupera email utente (dal token oppure dal DB)
    let userEmail = req.user.email;
    if (!userEmail) {
      const user = await User.findById(req.user.userId).select('email').lean();
      if (!user) return res.status(404).json({ message: "Utente non trovato" });
      userEmail = user.email;
    }

    // 📧 Invia email di conferma (asincrono per non bloccare la risposta)
    if (userEmail) {
      sendConfirmationEmail(userEmail, {
        date,
        time,
        doctor: appointment.title,
        _id: appointment._id // Aggiungo l'ID per l'email
      }).catch(err => console.error('❌ Email error:', err));
    }

    res.status(201).json(appointment);
  } catch (err) {
    console.error("❌ Errore creazione appuntamento:", err);
    res.status(500).json({ message: "Errore creazione appuntamento" });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    // 🔒 Sicurezza: solo il proprietario può vedere il suo appuntamento
    const appointment = await Appointment
      .findOne({ 
        _id: req.params.id, 
        user: req.user.userId 
      })
      .lean();
      
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    res.json(appointment);
  } catch (err) {
    console.error('❌ Get appointment error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update by ID
export const updateAppointment = async (req, res) => {
  try {
    // 🔒 Sicurezza: solo il proprietario può modificare
    const appointment = await Appointment.findOneAndUpdate(
      { 
        _id: req.params.id, 
        user: req.user.userId 
      },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // 🗑️ Pulisci cache quando modifichi
    cache.delete(`appointments_${req.user.userId}`);
    
    res.json(appointment);
  } catch (err) {
    console.error('❌ Update appointment error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete by ID
export const deleteAppointment = async (req, res) => {
  try {
    // 🔒 Sicurezza: solo il proprietario può eliminare
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // 🗑️ Pulisci cache quando elimini
    cache.delete(`appointments_${req.user.userId}`);
    
    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error('❌ Delete appointment error:', err);
    res.status(500).json({ message: "Server error" });
  }
};