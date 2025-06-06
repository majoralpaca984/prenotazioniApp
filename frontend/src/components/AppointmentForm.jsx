import React, { useState, useEffect } from "react";
import { Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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

  const navigate = useNavigate();
  const { id } = useParams();

  // Se c'è un id, carica i dati dell'appuntamento da backend
  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchAppointment();
    } else {
      setIsEdit(false);
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch appointment");
      const appointment = await response.json();
      // Format date for input
      const date = new Date(appointment.date);
      const formattedDate = date.toISOString().split("T")[0];

      setFormData({
        title: appointment.title,
        description: appointment.description || "",
        date: formattedDate,
        time: appointment.time,
        status: appointment.status,
      });
    } catch (error) {
      setError(error.message || "Failed to fetch appointment");
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        status: "scheduled",
      });
    } finally {
      setLoading(false);
    }
  };

  // Crea o aggiorna appuntamento
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { title, description, date, time, status } = formData;

    if (!title || !date || !time) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Check if date is not in the past (solo creazione)
    const selectedDate = new Date(date + "T" + time);
    const now = new Date();
    if (selectedDate < now && !isEdit) {
      setError("Cannot schedule appointments in the past");
      setLoading(false);
      return;
    }

    const appointmentData = {
      title,
      description,
      date,
      time,
      status,
    };

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Session expired, please login again.");
      setLoading(false);
      return;
    }

    try {
      let response;
      if (isEdit) {
        response = await fetch(`${API_URL}/appointments/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(appointmentData),
        });
      } else {
        response = await fetch(`${API_URL}/appointments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(appointmentData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save appointment");
      }

      // Dopo modifica/creazione torna al calendario
      navigate("/calendar");
    } catch (error) {
      setError(error.message || "Failed to save appointment");
      console.error("Error saving appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE appointment ---
  const handleDelete = async () => {
    if (!window.confirm("Sei sicuro di voler eliminare questo appuntamento?")) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Errore durante l'eliminazione.");
      navigate("/calendar");
    } catch (error) {
      setError(error.message || "Errore durante l'eliminazione.");
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

      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      );
      options.push(
        <option key={time} value={time}>
          {displayTime}
        </option>
      );
    }
  }
  return options;
};


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6}>
        <Card className="shadow">
          <Card.Header>
            <h4 className="mb-0">
              <i className={`fas ${isEdit ? "fa-edit" : "fa-plus"} me-2`}></i>
              {isEdit ? "Edit Appointment" : "New Appointment"}
              </h4>
          </Card.Header>
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="fas fa-heading me-2"></i>
                  Title *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  placeholder="Enter appointment title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="fas fa-align-left me-2"></i>
                  Description
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  placeholder="Enter appointment description (optional)"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-calendar me-2"></i>
                      Date *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-clock me-2"></i>
                      Time *
                    </Form.Label>
                    <Form.Select
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select time</option>
                      {generateTimeOptions()}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {isEdit && (
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="fas fa-info-circle me-2"></i>
                        Status
                      </Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              )}

              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="flex-grow-1"
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      {isEdit ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <i
                        className={`fas ${isEdit ? "fa-save" : "fa-plus"} me-2`}
                      ></i>
                      {isEdit ? "Update Appointment" : "Create Appointment"}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate("/calendar")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                {isEdit && (
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    <i className="fas fa-trash-alt me-2"></i>
                    Delete
                  </Button>
                )}
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default AppointmentForm;
