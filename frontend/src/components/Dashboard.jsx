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

  const deleteAppointment = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo appuntamento?")) return;
    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (!response.ok) throw new Error("Errore durante l'eliminazione");
      fetchAppointments();
    } catch (err) {
      alert("Errore durante l'eliminazione dell'appuntamento.");
    }
  };

  const upcomingAppointments = appointments
    .filter(a => new Date(`${a.date}T${a.time}`) >= new Date())
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    .slice(0, 5);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const appointmentTomorrow = appointments.find(a => {
    const apptDate = new Date(`${a.date}T${a.time}`);
    return apptDate.toDateString() === tomorrow.toDateString();
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
      return d.toDateString() === day.toDateString();
    });
    setSelectedDayAppointments(matches);
    setShowModal(true);
  };

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
                    return d.toDateString() === day.toDateString();
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

      <Card className="shadow">
        <Card.Header>
          <i className="fas fa-calendar-alt me-2"></i>
          Upcoming Appointments
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center">
              <span className="spinner-border text-primary"></span>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center text-muted py-3">
              <i className="fas fa-calendar-times fa-2x mb-3"></i>
              <div>No upcoming appointments</div>
            </div>
          ) : (
            <ListGroup className="d-grid gap-2">
              {upcomingAppointments.map((a) => (
                <ListGroup.Item
                  key={a._id}
                  className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2"
                  {...(role === "admin" ? { as: Link, to: `/appointment/edit/${a._id}`, action: true } : {})}
                >
                  <div>
                    <div className="fw-bold">{a.title}</div>
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      {new Date(a.date).toLocaleDateString()} {" "}
                      <i className="fas fa-clock ms-2 me-1"></i>
                      {a.time}
                    </small>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <span className={`badge bg-${a.status === "completed" ? "success" : a.status === "cancelled" ? "danger" : "primary"}`}>
                      {a.status}
                    </span>
                    {role === "user" && (
                      <Button variant="danger" size="sm" onClick={() => deleteAppointment(a._id)}>
                        <i className="fas fa-trash"></i>
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
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
