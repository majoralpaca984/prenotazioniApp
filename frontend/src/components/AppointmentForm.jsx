import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Button, Alert, Row, Col, Spinner } from "react-bootstrap";
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
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Caricamento appuntamento...</p>
          </div>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6}>
        <Card className="shadow">
          <Card.Header className="bg-primary text-white">
            <h4 className="mb-0">
              <i className={`fas ${isEdit ? "fa-edit" : "fa-plus"} me-2`}></i>
              {isEdit ? "Modifica Appuntamento" : "Nuovo Appuntamento"}
            </h4>
          </Card.Header>
          <Card.Body className="p-4">
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="fas fa-heading me-2"></i>
                  Titolo *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  placeholder="Es. Visita cardiologica, Analisi del sangue..."
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                />
                <Form.Text className="text-muted">
                  {formData.title.length}/100 caratteri
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="fas fa-align-left me-2"></i>
                  Descrizione
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  placeholder="Aggiungi dettagli opzionali sull'appuntamento..."
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={500}
                />
                <Form.Text className="text-muted">
                  {formData.description.length}/500 caratteri
                </Form.Text>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-calendar me-2"></i>
                      Data *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={isEdit ? undefined : new Date().toISOString().split("T")[0]}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-clock me-2"></i>
                      Orario *
                    </Form.Label>
                    <Form.Select
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleziona orario</option>
                      {generateTimeOptions()}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {isEdit && (
                <Form.Group className="mb-4">
                  <Form.Label>
                    <i className="fas fa-info-circle me-2"></i>
                    Stato
                  </Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="scheduled">Programmato</option>
                    <option value="completed">Completato</option>
                    <option value="cancelled">Annullato</option>
                  </Form.Select>
                </Form.Group>
              )}

              {/* 🎛️ PULSANTI AZIONE */}
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="flex-grow-1"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {isEdit ? "Aggiornamento..." : "Creazione..."}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${isEdit ? "fa-save" : "fa-plus"} me-2`}></i>
                      {isEdit ? "Aggiorna Appuntamento" : "Crea Appuntamento"}
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate("/calendar")}
                  disabled={loading}
                >
                  <i className="fas fa-times me-2"></i>
                  Annulla
                </Button>
                
                {isEdit && (
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={loading}
                    title="Elimina appuntamento"
                  >
                    <i className="fas fa-trash-alt me-2"></i>
                    Elimina
                  </Button>
                )}
              </div>
            </Form>

            {/* 💡 INFO HELPER */}
            <div className="mt-4 p-3 bg-light rounded">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                <strong>Informazioni:</strong> Puoi prenotare dalle 7:00 alle 18:00 
                con intervalli di 15 minuti. {!isEdit && "Non è possibile prenotare nel passato."}
              </small>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default AppointmentForm;