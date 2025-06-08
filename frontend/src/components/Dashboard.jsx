import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, ListGroup, Alert, Table, Modal } from "react-bootstrap";
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

  const today = new Date();
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(today.getDate() + i);
    return day;
  });

  const handleDayClick = (day) => {
    const matches = appointments.filter((a) => {
      const d = new Date(`${a.date}T${a.time}`);
      return isSameDay(d, day);
    });
    setSelectedDayAppointments(matches);
    setShowModal(true);
  };

  const futureAppointments = appointments.filter(a => new Date(`${a.date}T${a.time}`) >= new Date());
  const pastAppointments = appointments.filter(a => new Date(`${a.date}T${a.time}`) < new Date());
  const nextAppointment = futureAppointments.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))[0];
  const lastAppointment = pastAppointments.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`))[0];

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
            New Appointment
          </Button>
        </Col>
      </Row>

      {appointmentTomorrow && (
        <Alert variant="warning">
          Hai un appuntamento domani alle {appointmentTomorrow.time} con {appointmentTomorrow.title} ⏰
        </Alert>
      )}

      <Card className="mb-4 shadow">
        <Card.Header>
          <i className="fas fa-calendar-week me-2"></i>
          Settimana Corrente
        </Card.Header>
        <Card.Body>
          <Table responsive borderless className="text-center">
            <thead>
              <tr>
                {daysOfWeek.map((day, idx) => (
                  <th key={idx}>{day.toLocaleDateString("it-IT", { weekday: "short", day: "numeric" })}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {daysOfWeek.map((day, idx) => {
                  const found = appointments.find(a => {
                    const d = new Date(`${a.date}T${a.time}`);
                    return isSameDay(d, day);
                  });
                  return (
                    <td
                      key={idx}
                      onClick={() => handleDayClick(day)}
                      className={found ? "bg-light border rounded text-success cursor-pointer" : "text-muted cursor-pointer"}
                      style={{ cursor: "pointer" }}
                    >
                      {found ? `${found.time}` : "-"}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="mb-4 shadow">
        <Card.Header>
          <i className="fas fa-chart-line me-2"></i>
          Riepilogo Appuntamenti
        </Card.Header>
        <Card.Body>
          <p><strong>Totale prenotazioni:</strong> {appointments.length}</p>
          <p><strong>Prossimo appuntamento:</strong> {nextAppointment ? `${nextAppointment.title} il ${new Date(nextAppointment.date).toLocaleDateString()} alle ${nextAppointment.time}` : "Nessuno"}</p>
          <p><strong>Ultimo appuntamento effettuato:</strong> {lastAppointment ? `${lastAppointment.title} il ${new Date(lastAppointment.date).toLocaleDateString()} alle ${lastAppointment.time}` : "Nessuno"}</p>
        </Card.Body>
      </Card>

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
