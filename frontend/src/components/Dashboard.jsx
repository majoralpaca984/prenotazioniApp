import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Alert, Modal, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getUserRole() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "user";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || "user";
  } catch {
    return "user";
  }
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const role = getUserRole();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error("Errore durante il recupero degli appuntamenti", err);
      setError("Errore durante il recupero degli appuntamenti.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const appointmentTomorrow = appointments.find(a => {
    const apptDate = new Date(`${a.date}T${a.time}`);
    return isSameDay(apptDate, tomorrow);
  });

  const futureAppointments = appointments.filter(a => new Date(`${a.date}T${a.time}`) >= new Date());
  const pastAppointments = appointments.filter(a => new Date(`${a.date}T${a.time}`) < new Date());
  const nextAppointment = futureAppointments.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))[0];
  const lastAppointment = pastAppointments.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`))[0];

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div>
      <Row className="mb-4">
        <Col md={8}>
          <h2>
            <i className="fas fa-tachometer-alt me-2"></i>
            Dashboard
          </h2>
        </Col>
        <Col md={4} className="text-md-end">
          <Button as={Link} to="/appointment/new" variant="primary">
            <i className="fas fa-plus me-2"></i>
            Nuovo Appuntamento
          </Button>
        </Col>
      </Row>

      {appointmentTomorrow && (
        <Alert variant="warning">
          Hai un appuntamento domani alle {appointmentTomorrow.time} con <strong>{appointmentTomorrow.title}</strong> ⏰
        </Alert>
      )}

      <Card className="summary-box p-4 mb-4 shadow-sm border-0">
        <Card.Body>
          <h5 className="mb-4 text-primary-emphasis fw-bold">
            📅 Riepilogo Appuntamenti
          </h5>
          <p className="mb-2">
            <strong>Totale prenotazioni:</strong> {appointments.length}
          </p>
          <p className="mb-2">
            <strong>Prossimo appuntamento:</strong>{" "}
            {nextAppointment
              ? `${nextAppointment.title} il ${formatDate(nextAppointment.date)} alle ${nextAppointment.time}`
              : "Nessuno"}
          </p>
          <p>
            <strong>Ultimo appuntamento effettuato:</strong>{" "}
            {lastAppointment
              ? `${lastAppointment.title} il ${formatDate(lastAppointment.date)} alle ${lastAppointment.time}`
              : "Nessuno"}
          </p>
        </Card.Body>
      </Card>

      {/* MODAL opzionale per future espansioni */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Appuntamenti del giorno</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDayAppointments.length === 0 ? (
            <p>Nessun appuntamento per questo giorno.</p>
          ) : (
            <ListGroup>
              {selectedDayAppointments.map((a) => (
                <ListGroup.Item key={a._id}>
                  <strong>{a.title}</strong> alle {a.time}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Chiudi
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Dashboard;
