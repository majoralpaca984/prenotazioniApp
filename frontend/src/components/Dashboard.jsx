import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, ListGroup, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Utility per il ruolo (decodifica JWT)
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
      if (!response.ok) throw new Error("Errore durante il recupero appuntamenti");
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError("Errore durante il recupero degli appuntamenti.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // DELETE per users (e admin se vuoi)
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
      // Ricarica la lista
      fetchAppointments();
    } catch (err) {
      alert("Errore durante l'eliminazione dell'appuntamento.");
    }
  };

  // Mostra solo i futuri
  const upcomingAppointments = appointments
    .filter(a => new Date(`${a.date}T${a.time}`) >= new Date())
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    .slice(0, 5);

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

      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center shadow">
            <Card.Body>
              <h4>
                <i className="fas fa-calendar-check me-2 text-primary"></i>
                {appointments.length}
              </h4>
              <div className="text-muted mb-0">Total Appointments</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow">
            <Card.Body>
              <h4>
                <i className="fas fa-clock me-2 text-success"></i>
                {appointments.filter(a => a.status === "scheduled").length}
              </h4>
              <div className="text-muted mb-0">Upcoming</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow">
            <Card.Body>
              <h4>
                <i className="fas fa-check-circle me-2 text-secondary"></i>
                {appointments.filter(a => a.status === "completed").length}
              </h4>
              <div className="text-muted mb-0">Completed</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
            <ListGroup>
              {upcomingAppointments.map((a) => (
                <ListGroup.Item
                  key={a._id}
                  className="d-flex justify-content-between align-items-center"
                  {...(role === "admin" ? { as: Link, to: `/appointment/edit/${a._id}`, action: true } : {})}
                >
                  <div>
                    <div className="fw-bold">{a.title}</div>
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      {new Date(a.date).toLocaleDateString()}{" "}
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
    </div>
  );
}

export default Dashboard;
