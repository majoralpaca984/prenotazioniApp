import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Alert, Modal, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      setError("Errore nel caricamento.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const appointmentTomorrow = appointments.find((a) =>
    isSameDay(new Date(`${a.date}T${a.time}`), tomorrow)
  );

  const future = appointments.filter((a) => new Date(`${a.date}T${a.time}`) >= new Date());
  const past = appointments.filter((a) => new Date(`${a.date}T${a.time}`) < new Date());

  const nextAppointment = future.sort(
    (a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
  )[0];

  const lastAppointment = past.sort(
    (a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)
  )[0];

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return date;
  });

  const handleDayClick = (day) => {
    const found = appointments.filter((a) =>
      isSameDay(new Date(`${a.date}T${a.time}`), day)
    );
    setSelectedDayAppointments(found);
    setShowModal(true);
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={8}>
          <h2 className="main-title">
            <i className="fas fa-tachometer-alt me-2"></i> Dashboard
          </h2>
        </Col>
        <Col md={4} className="text-end">
          <Button as={Link} to="/appointment/new" variant="primary">
            <i className="fas fa-plus me-2"></i> Nuovo Appuntamento
          </Button>
        </Col>
      </Row>

      {appointmentTomorrow && (
        <Alert variant="warning">
          Hai un appuntamento domani alle {appointmentTomorrow.time} con <strong>{appointmentTomorrow.title}</strong> ⏰
        </Alert>
      )}

      <Row className="gy-4">
        {/* CARD RIEPILOGO */}
        <Col md={6}>
          <Card className="summary-card p-4 h-100">
            <Card.Body>
              <h5 className="fw-bold text-accent mb-4">📊 Riepilogo Appuntamenti</h5>
              <p><span>📋</span> <strong>Totali:</strong> {appointments.length}</p>
              <p><span>🕒</span> <strong>Prossimo:</strong> {nextAppointment ? `${nextAppointment.title} il ${formatDate(nextAppointment.date)} alle ${nextAppointment.time}` : "Nessuno"}</p>
              <p><span>✅</span> <strong>Ultimo:</strong> {lastAppointment ? `${lastAppointment.title} il ${formatDate(lastAppointment.date)} alle ${lastAppointment.time}` : "Nessuno"}</p>
            </Card.Body>
          </Card>
        </Col>

        {/* CARD MINI CALENDARIO */}
        <Col md={6}>
          <Card className="calendar-card p-4 h-100">
            <Card.Body>
              <h5 className="fw-bold text-accent mb-4">🗓️ Settimana Corrente</h5>
              <div className="d-flex justify-content-between flex-wrap text-center">
                {weekDays.map((day, idx) => {
                  const match = appointments.find((a) =>
                    isSameDay(new Date(`${a.date}T${a.time}`), day)
                  );
                  return (
                    <div
                      key={idx}
                      className={`calendar-day-mini ${match ? "has-appointment" : ""}`}
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="fw-bold">{day.toLocaleDateString("it-IT", { weekday: "short" })}</div>
                      <div className="small">{day.getDate()}/{day.getMonth() + 1}</div>
                      <div className="text-muted small mt-1">
                        {match ? match.time : "-"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MODAL GIORNO SELEZIONATO */}
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>Chiudi</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Dashboard;
