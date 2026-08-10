import Appointment from '../models/Appointment.js';
import { sendConfirmationEmail } from './emailController.js'; 
import User from '../models/User.js';

const VALID_STATUSES = new Set(["scheduled", "completed", "cancelled"]);

const buildAppointmentPayload = ({ title, description = "", date, time, status = "scheduled" }) => {
  const trimmedTitle = title?.trim();
  const trimmedDescription = description?.trim() || "";

  if (!trimmedTitle || !date || !time) {
    return { error: "Titolo, data e ora sono obbligatori" };
  }

  if (trimmedTitle.length < 3) {
    return { error: "Il titolo deve essere di almeno 3 caratteri" };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return { error: "Data o orario non validi" };
  }

  const appointmentDate = new Date(`${date}T${time}`);
  if (Number.isNaN(appointmentDate.getTime())) {
    return { error: "Data o orario non validi" };
  }

  const [hour, minute] = time.split(":").map(Number);
  const isValidWorkingSlot = hour >= 7 && hour <= 18 && minute % 15 === 0 && !(hour === 18 && minute > 0);
  if (!isValidWorkingSlot) {
    return { error: "Puoi prenotare solo dalle 7:00 alle 18:00 con intervalli di 15 minuti" };
  }

  if (!VALID_STATUSES.has(status)) {
    return { error: "Stato appuntamento non valido" };
  }

  return {
    payload: {
      title: trimmedTitle,
      description: trimmedDescription,
      date: appointmentDate,
      time,
      status,
    },
  };
};

const isSlotTaken = async ({ userId, appointmentDate, excludeAppointmentId }) => {
  const query = {
    user: userId,
    date: appointmentDate,
    status: { $ne: "cancelled" },
  };

  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  return Appointment.findOne(query).lean();
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment
      .find({ user: req.user.userId })
      .sort({ date: 1 })
      .lean();

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: "Errore nel caricamento degli appuntamenti" });
  }
};

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const { payload, error } = buildAppointmentPayload(req.body);
    
    if (error) {
      return res.status(400).json({ message: error });
    }

    // Controlla che la data non sia nel passato
    if (payload.date < new Date()) {
      return res.status(400).json({ message: "Non puoi prenotare nel passato"});
    }

    // Controlla se lo slot è già occupato (ottimizzato)
    const slotTaken = await isSlotTaken({
      userId: req.user.userId,
      appointmentDate: payload.date,
    });

    if (slotTaken) {
      return res.status(400).json({ message: "Slot già occupato!" });
    }

    // Crea nuovo appuntamento
    const appointment = new Appointment({
      ...payload,
      user: req.user.userId,
    });

    await appointment.save();

    // Recupera email utente (dal token oppure dal DB)
    let userEmail = req.user.email;
    if (!userEmail) {
      const user = await User.findById(req.user.userId).select('email').lean();
      if (!user) return res.status(404).json({ message: "Utente non trovato" });
      userEmail = user.email;
    }

    //  Invia email di conferma (asincrono per non bloccare la risposta)
    if (userEmail) {
      sendConfirmationEmail(userEmail, {
        date: req.body.date,
        time: payload.time,
        doctor: appointment.title,
        _id: appointment._id // Aggiungo l'ID per l'email
      }).catch(err => console.error('Email error:', err.message));
    }

    res.status(201).json(appointment);
  } catch (err) {
    console.error("Errore creazione appuntamento:", err);
    res.status(500).json({ message: "Errore creazione appuntamento" });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    //  Sicurezza: solo il proprietario può vedere il suo appuntamento
    const appointment = await Appointment
      .findOne({ 
        _id: req.params.id, 
        user: req.user.userId 
      })
      .lean();
      
    if (!appointment) {
      return res.status(404).json({ message: "Appuntamento non trovato" });
    }
    
    res.json(appointment);
  } catch (err) {
    console.error('Get appointment error:', err);
    res.status(500).json({ message: "Errore del server" });
  }
};

// Update by ID
export const updateAppointment = async (req, res) => {
  try {
    const { payload, error } = buildAppointmentPayload(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    if (payload.date < new Date()) {
      return res.status(400).json({ message: "Non puoi spostare un appuntamento nel passato" });
    }

    const slotTaken = await isSlotTaken({
      userId: req.user.userId,
      appointmentDate: payload.date,
      excludeAppointmentId: req.params.id,
    });

    if (slotTaken) {
      return res.status(400).json({ message: "Slot già occupato!" });
    }

    //  Sicurezza: solo il proprietario può modificare
    const appointment = await Appointment.findOneAndUpdate(
      { 
        _id: req.params.id, 
        user: req.user.userId 
      },
      payload,
      { new: true, runValidators: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: "Appuntamento non trovato" });
    }
    
    res.json(appointment);
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({ message: "Errore del server" });
  }
};

// Delete by ID
export const deleteAppointment = async (req, res) => {
  try {
    //  Sicurezza: solo il proprietario può eliminare
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!appointment) {
      return res.status(404).json({ message: "Appuntamento non trovato" });
    }

    res.json({ message: "Appuntamento eliminato" });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ message: "Errore del server" });
  }
};
