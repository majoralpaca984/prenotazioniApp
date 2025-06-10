import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Button, Row, Col, Alert, Modal, ListGroup, Spinner, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function generateMonthDays() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
}

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // 🚀 NUOVI STATI per ottimizzazioni
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const navigate = useNavigate();
  const monthDays = generateMonthDays();

  // 🔄 FETCH OTTIMIZZATO con cache e callback
  const fetchAppointments = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      setAppointments(data);
      setLastUpdate(Date.now());
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError("Errore nel caricamento degli appuntamenti");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // 🔄 AUTO-REFRESH ogni 2 minuti
  useEffect(() => {
    fetchAppointments();
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh dashboard...');
      fetchAppointments(false); // Refresh silenzioso
    }, 2 * 60 * 1000); // 2 minuti

    return () => clearInterval(interval);
  }, [fetchAppointments]);

  // 👂 ASCOLTI CAMBIAMENTI da altri componenti
  useEffect(() => {
    // Quando torni alla finestra, refresh se sono passati >30s
    const handleFocus = () => {
      if (Date.now() - lastUpdate > 30000) {
        console.log('🔄 Window focus refresh...');
        fetchAppointments(false);
      }
    };

    // Quando AppointmentForm crea/modifica/elimina
    const handleStorageChange = (e) => {
      if (e.key === 'appointment_updated') {
        console.log('🔄 Storage change detected...');
        fetchAppointments(false);
        localStorage.removeItem('appointment_updated'); // Cleanup
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchAppointments, lastUpdate]);

  // 📊 STATISTICHE CALCOLATE con useMemo (performance!)
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const future = appointments.filter((a) => new Date(`${a.date}T${a.time}`) >= now);
    const past = appointments.filter((a) => new Date(`${a.date}T${a.time}`) < now);
    const todayAppts = appointments.filter((a) => isSameDay(new Date(`${a.date}T${a.time}`), today));

    return {
      total: appointments.length,
      future: future.length,
      today: todayAppts.length,
      appointmentTomorrow: appointments.find((a) => isSameDay(new Date(`${a.date}T${a.time}`), tomorrow)),
      nextAppointment: future.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))[0],
      lastAppointment: past.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`))[0],
      futureList: future.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    };
  }, [appointments]);

  // 🔄 REFRESH MANUALE
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments(false);
    setRefreshing(false);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatDateTime = (date, time) => {
    return new Date(date).toLocaleDateString("it-IT", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  };

  const handleDayClick = (day) => {
    const found = appointments.filter((a) =>
      isSameDay(new Date(`${a.date}T${a.time}`), day)
    );
    setSelectedDayAppointments(found);
    setShowModal(true);
  };

  // 🏃‍♂️ LOADING INIZIALE
  if (loading && appointments.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Caricamento dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <h2 className="main-title">
            <i className="fas fa-tachometer-alt me-2"></i> Dashboard
          </h2>
          <small className="text-muted">
            Ultimo aggiornamento: {new Date(lastUpdate).toLocaleTimeString("it-IT")}
          </small>
        </Col>
        <Col md={6} className="text-end">
          {/* 🔄 PULSANTE REFRESH */}
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="me-2"
            title="Aggiorna dati"
          >
            {refreshing ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <i className="fas fa-sync-alt"></i>
            )}
          </Button>
          
          <Button as={Link} to="/appointment/new" variant="primary">
            <i className="fas fa-plus me-2"></i> Nuovo Appuntamento
          </Button>
        </Col>
      </Row>

      {/* 🚨 ERRORI */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* ⏰ APPUNTAMENTO DOMANI */}
      {stats.appointmentTomorrow && (
        <Alert variant="warning" className="d-flex align-items-center justify-content-between">
          <div>
            <i className="fas fa-bell me-2"></i>
            Hai un appuntamento <strong>domani</strong> alle {stats.appointmentTomorrow.time} -{" "}
            <strong>{stats.appointmentTomorrow.title}</strong>
          </div>
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => navigate(`/appointment/edit/${stats.appointmentTomorrow._id}`)}
          >
            Modifica
          </Button>
        </Alert>
      )}

      <Row className="gy-4">
        {/* 📊 CARD RIEPILOGO MIGLIORATA */}
        <Col md={6}>
          <Card className="summary-card p-4 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-accent mb-0">📊 Riepilogo</h5>
                {refreshing && <Spinner animation="border" size="sm" />}
              </div>
              
              {/* 📈 STATISTICHE VELOCI */}
              <Row className="text-center mb-3">
                <Col xs={4}>
                  <div className="h3 text-primary mb-0">{stats.total}</div>
                  <small className="text-muted">Totali</small>
                </Col>
                <Col xs={4}>
                  <div className="h3 text-success mb-0">{stats.future}</div>
                  <small className="text-muted">Futuri</small>
                </Col>
                <Col xs={4}>
                  <div className="h3 text-info mb-0">{stats.today}</div>
                  <small className="text-muted">Oggi</small>
                </Col>
              </Row>

              {/* 🕒 PROSSIMO APPUNTAMENTO */}
              {stats.nextAppointment && (
                <div className="border-top pt-3">
                  <p className="mb-1">
                    <i className="fas fa-clock text-primary me-1"></i>
                    <strong>Prossimo:</strong>
                  </p>
                  <div className="ms-3">
                    <div className="fw-bold">{stats.nextAppointment.title}</div>
                    <small className="text-muted">
                      {formatDate(stats.nextAppointment.date)} alle {stats.nextAppointment.time}
                    </small>
                  </div>
                </div>
              )}

              {/* ✅ ULTIMO APPUNTAMENTO */}
              {stats.lastAppointment && (
                <div className="border-top pt-3 mt-2">
                  <p className="mb-1">
                    <i className="fas fa-check-circle text-success me-1"></i>
                    <strong>Ultimo:</strong>
                  </p>
                  <div className="ms-3">
                    <div className="fw-bold">{stats.lastAppointment.title}</div>
                    <small className="text-muted">
                      {formatDate(stats.lastAppointment.date)}
                    </small>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* 📅 TIMELINE PROSSIMI APPUNTAMENTI MIGLIORATA */}
        <Col md={6}>
          <Card className="calendar-card p-4 h-100">
            <Card.Body>
              <h5 className="fw-bold text-accent mb-4">📅 Prossimi Appuntamenti</h5>
              {stats.futureList.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-calendar-plus fa-3x text-muted mb-3"></i>
                  <p className="text-muted">Nessun appuntamento futuro</p>
                  <Button as={Link} to="/appointment/new" variant="primary" size="sm">
                    Prenota ora
                  </Button>
                </div>
              ) : (
                <div className="timeline-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {stats.futureList.slice(0, 5).map((appointment) => (
                    <div 
                      key={appointment._id} 
                      className="timeline-item mb-3 cursor-pointer"
                      onClick={() => navigate(`/appointment/edit/${appointment._id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="small fw-bold text-muted mb-1">
                            {formatDateTime(appointment.date)} alle {appointment.time}
                          </div>
                          <div className="fw-bold">{appointment.title}</div>
                          {appointment.description && (
                            <small className="text-muted">{appointment.description}</small>
                          )}
                        </div>
                        <Badge bg="primary" className="ms-2">
                          {appointment.status || 'scheduled'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {/* 👀 MOSTRA PIÙ */}
                  {stats.futureList.length > 5 && (
                    <div className="text-center mt-3">
                      <Button variant="outline-primary" size="sm" as={Link} to="/calendar">
                        Vedi tutti ({stats.futureList.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MODAL GIORNO SELEZIONATO (invariato) */}
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
                <ListGroup.Item key={a._id} className="d-flex justify-content-between">
                  <div>
                    <strong>{a.title}</strong>
                    <div className="small text-muted">{a.time}</div>
                  </div>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => {
                      navigate(`/appointment/edit/${a._id}`);
                      setShowModal(false);
                    }}
                  >
                    Modifica
                  </Button>
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

      {/* FOOTER FISSO MIGLIORATO */}
      <footer className="dashboard-footer">
        <Link to="/">
          <i className="fas fa-home"></i>
        </Link>
        <Link to="/calendar">
          <i className="fas fa-calendar-alt"></i>
        </Link>
        <button 
          onClick={handleRefresh}
          style={{ background: "none", border: "none" }}
          disabled={refreshing}
          title="Aggiorna"
        >
          <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''}`}></i>
        </button>
        <button disabled style={{ background: "none", border: "none", opacity: 0.4 }}>
          <i className="fas fa-cog"></i>
        </button>
      </footer>
    </div>
  );
}

export default Dashboard;