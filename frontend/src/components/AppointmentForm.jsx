import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// 🔔 FUNZIONE per notificare altri componenti dei cambiamenti
const notifyAppointmentChange = (action, appointmentId = null) => {
  // Notifica Dashboard e Calendar tramite localStorage
  localStorage.setItem('appointment_updated', JSON.stringify({
    action,
    appointmentId,
    timestamp: Date.now()
  }));
  
  console.log(`🔔 Notified other components: ${action}`, appointmentId);
  
  // Rimuovi dopo un po' per evitare accumulo
  setTimeout(() => {
    localStorage.removeItem('appointment_updated');
  }, 5000);
};

function AppointmentForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    status: "scheduled",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // 🔄 API HELPER ottimizzato
  const apiCall = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("Session expired, please login again.");
    }

    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }, []);

  // Se c'è un id, carica i dati dell'appuntamento da backend
  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchAppointment();
    } else {
      setIsEdit(false);
      // 📅 PRE-POPOLA la data con oggi per UX migliore
      const today = new Date().toISOString().split("T")[0];
      setFormData(prev => ({ ...prev, date: today }));
    }
  }, [id]);

  const fetchAppointment = async () => {
    setInitialLoading(true);
    try {
      const appointment = await apiCall(`/appointments/${id}`);
      
      // Format date for input
      const date = new Date(appointment.date);
      const formattedDate = date.toISOString().split("T")[0];

      setFormData({
        title: appointment.title || "",
        description: appointment.description || "",
        date: formattedDate,
        time: appointment.time || "",
        status: appointment.status || "scheduled",
      });
    } catch (error) {
      console.error('❌ Failed to fetch appointment:', error);
      setError(error.message || "Failed to fetch appointment");
      
      // Mantieni form vuoto in caso di errore
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        status: "scheduled",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  // 🛡️ VALIDAZIONE MIGLIORATA
  const validateForm = () => {
    const { title, date, time } = formData;
    
    if (!title.trim()) {
      setError("Il titolo è obbligatorio");
      return false;
    }
    
    if (title.trim().length < 3) {
      setError("Il titolo deve essere di almeno 3 caratteri");
      return false;
    }
    
    if (!date) {
      setError("La data è obbligatoria");
      return false;
    }
    
    if (!time) {
      setError("L'orario è obbligatorio");
      return false;
    }

    // Verifica che la data non sia nel passato (solo per nuovi appuntamenti)
    if (!isEdit) {
      const selectedDateTime = new Date(`${date}T${time}`);
      const now = new Date();
      
      if (selectedDateTime < now) {
        setError("Non puoi prenotare un appuntamento nel passato");
        return false;
      }
    }

    return true;
  };

  // Crea o aggiorna appuntamento
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;

    setLoading(true);

    const appointmentData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date,
      time: formData.time,
      status: formData.status,
    };

    try {
      let result;
      if (isEdit) {
        result = await apiCall(`/appointments/${id}`, {
          method: "PUT",
          body: JSON.stringify(appointmentData),
        });
        // 🔔 Notifica modifica
        notifyAppointmentChange('updated', id);
      } else {
        result = await apiCall("/appointments", {
          method: "POST",
          body: JSON.stringify(appointmentData),
        });
        // 🔔 Notifica creazione
        notifyAppointmentChange('created', result._id);
      }

      // 🎉 Redirect con messaggio di successo
      navigate("/calendar", { 
        state: { 
          message: isEdit ? "Appuntamento aggiornato con successo!" : "Appuntamento creato con successo!",
          type: "success"
        }
      });
    } catch (error) {
      setError(error.message || "Failed to save appointment");
      console.error("❌ Error saving appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE appointment ---
  const handleDelete = async () => {
    const confirmMessage = `Sei sicuro di voler eliminare l'appuntamento "${formData.title}"?\n\nQuesta azione non può essere annullata.`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setLoading(true);
    setError("");
    
    try {
      await apiCall(`/appointments/${id}`, { method: "DELETE" });
      
      // 🔔 Notifica eliminazione
      notifyAppointmentChange('deleted', id);
      
      navigate("/calendar", { 
        state: { 
          message: "Appuntamento eliminato con successo",
          type: "info"
        }
      });
    } catch (error) {
      setError(error.message || "Errore durante l'eliminazione.");
      console.error("❌ Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Handler per andare al pagamento
  const handleGoToPayment = () => {
    // Valida prima i dati base
    if (!formData.title.trim() || !formData.date || !formData.time) {
      setError("Compila almeno titolo, data e orario prima di procedere al pagamento");
      return;
    }

    // Parametri per la pagina di pagamento
    const params = new URLSearchParams({
      doctorId: "custom",
      doctorName: "Appuntamento Personalizzato",
      speciality: formData.title,
      date: formData.date,
      time: formData.time,
      price: "80",
      examType: formData.title
    });
    
    navigate(`/payment?${params.toString()}`);
  };

  // Per generare solo le ore tra le 7:00 e le 18:00 (incluso)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 7; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Non aggiungere minuti > 0 per l'ultima ora (le 18:00, non 18:15 ecc)
        if (hour === 18 && minute > 0) break;

        const timeValue = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const displayTime = new Date(`2000-01-01T${timeValue}`).toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        });

        options.push(
          <option key={timeValue} value={timeValue}>
            {displayTime}
          </option>
        );
      }
    }
    return options;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 🧹 Pulisci errore quando l'utente inizia a digitare
    if (error) setError("");
  };

  // 🏃‍♂️ LOADING INIZIALE per edit
  if (initialLoading) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Caricamento appuntamento...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="card">
          <div className="card-header bg-primary-500 text-white">
            <h4 className="text-xl font-semibold flex items-center gap-2">
              <i className={`fas ${isEdit ? "fa-edit" : "fa-plus"}`}></i>
              {isEdit ? "Modifica Appuntamento" : "Nuovo Appuntamento"}
            </h4>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger mb-6">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
                <button 
                  onClick={() => setError("")}
                  className="ml-auto text-danger-600 hover:text-danger-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="form-label flex items-center gap-2">
                  <i className="fas fa-heading"></i>
                  Titolo *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Es. Visita cardiologica, Analisi del sangue..."
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="form-control"
                />
                <small className="text-gray-500 dark:text-gray-400">
                  {formData.title.length}/100 caratteri
                </small>
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <i className="fas fa-align-left"></i>
                  Descrizione
                </label>
                <textarea
                  rows={3}
                  name="description"
                  placeholder="Aggiungi dettagli opzionali sull'appuntamento..."
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={500}
                  className="form-control"
                />
                <small className="text-gray-500 dark:text-gray-400">
                  {formData.description.length}/500 caratteri
                </small>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label flex items-center gap-2">
                    <i className="fas fa-calendar"></i>
                    Data *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={isEdit ? undefined : new Date().toISOString().split("T")[0]}
                    required
                    className="form-control"
                  />
                </div>
                <div>
                  <label className="form-label flex items-center gap-2">
                    <i className="fas fa-clock"></i>
                    Orario *
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">Seleziona orario</option>
                    {generateTimeOptions()}
                  </select>
                </div>
              </div>

              {isEdit && (
                <div>
                  <label className="form-label flex items-center gap-2">
                    <i className="fas fa-info-circle"></i>
                    Stato
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="scheduled">Programmato</option>
                    <option value="completed">Completato</option>
                    <option value="cancelled">Annullato</option>
                  </select>
                </div>
              )}

              {/* 🎛️ PULSANTI AZIONE */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn btn-primary"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {isEdit ? "Aggiornamento..." : "Creazione..."}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${isEdit ? "fa-save" : "fa-plus"}`}></i>
                      {isEdit ? "Aggiorna Appuntamento" : "Crea Appuntamento"}
                    </>
                  )}
                </button>

                {/* 🆕 BOTTONE PAGAMENTO - Sempre disponibile */}
                <button
                  type="button"
                  onClick={handleGoToPayment}
                  disabled={loading}
                  className="flex-1 btn bg-green-600 hover:bg-green-700 text-white"
                >
                  <i className="fas fa-credit-card mr-2"></i>
                  {isEdit ? "Procedi al Pagamento" : "Vai al Pagamento"}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate("/calendar")}
                  disabled={loading}
                  className="btn btn-outline-secondary"
                >
                  <i className="fas fa-times mr-2"></i>
                  Annulla
                </button>
                
                {isEdit && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    title="Elimina appuntamento"
                    className="btn btn-danger"
                  >
                    <i className="fas fa-trash-alt mr-2"></i>
                    Elimina
                  </button>
                )}
              </div>
            </form>

            {/* 💡 INFO HELPER */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <small className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                <span>
                  <strong>Informazioni:</strong> Puoi prenotare dalle 7:00 alle 18:00 
                  con intervalli di 15 minuti. {!isEdit && "Non è possibile prenotare nel passato. "}
                  Usa il bottone verde per completare il pagamento dell'appuntamento.
                </span>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentForm;