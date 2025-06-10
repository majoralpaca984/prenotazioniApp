// src/views/CalendarPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Row, Col, Alert, Spinner, Badge, Card } from "react-bootstrap";
import Calendar from "../components/Calendar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// 🔐 Utility per ruolo utente
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

function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const location = useLocation();
  const navigate = useNavigate();

  // 🎉 GESTISCI MESSAGGI DA AppointmentForm
  const [locationMessage, setLocationMessage] = useState(location.state?.message || "");
  const [messageType, setMessageType] = useState(location.state?.type || "info");

  useEffect(() => {
    if (locationMessage) {
      const timer = setTimeout(() => {
        setLocationMessage("");
        // Pulisci location state
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [locationMessage]);

  // 🔄 FETCH OTTIMIZZATO con cache e callback
  const fetchAppointments = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      setAppointments(data);
      setLastUpdate(Date.now());
    } catch (err) {
      console.error('❌ Calendar fetch error:', err);
      setError("Errore nel caricamento del calendario");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // 🔄 AUTO-REFRESH ogni 90 secondi (meno frequente del Dashboard)
  useEffect(() => {
    fetchAppointments();
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh calendar...');
      fetchAppointments(false);
    }, 90 * 1000); // 90 secondi

    return () => clearInterval(interval);
  }, [fetchAppointments]);

  // 👂 ASCOLTA CAMBIAMENTI da AppointmentForm e Dashboard
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'appointment_updated') {
        console.log('🔄 Calendar: Storage change detected...');
        fetchAppointments(false);
      }
    };

    const handleFocus = () => {
      if (Date.now() - lastUpdate > 30000) {
        console.log('🔄 Calendar: Window focus refresh...');
        fetchAppointments(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchAppointments, lastUpdate]);

  // 📊 CALCOLI OTTIMIZZATI con useMemo
  const calendarStats = useMemo(() => {
    const monthAppointments = appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate.getFullYear() === year && appDate.getMonth() === month;
    });

    const todayAppointments = appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate.toDateString() === today.toDateString();
    });

    const upcomingAppointments = appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate > today;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      monthTotal: monthAppointments.length,
      todayTotal: todayAppointments.length,
      upcomingTotal: upcomingAppointments.length,
      nextAppointment: upcomingAppointments[0],
      appointmentsForMonth: monthAppointments
    };
  }, [appointments, year, month, today]);

  // 🗓️ NAVIGAZIONE MESI
  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  // 🏠 VAI A OGGI
  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(today);
  };

  // 🔄 REFRESH MANUALE
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments(false);
    setRefreshing(false);
  };

  const monthNames = [
    "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
    "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"
  ];

  const isAdmin = getUserRole() === "admin";

  // 🏃‍♂️ LOADING INIZIALE
  if (loading && appointments.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Caricamento calendario...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 📋 HEADER CON CONTROLLI */}
      <Row className="mb-4 align-items-center">
        <Col md={8}>
          <h2 className="main-title">
            <i className="fas fa-calendar-alt me-2"></i>
            Calendario
          </h2>
          <div className="d-flex gap-3 mt-2">
            <Badge bg="primary">{calendarStats.monthTotal} questo mese</Badge>
            <Badge bg="success">{calendarStats.todayTotal} oggi</Badge>
            <Badge bg="info">{calendarStats.upcomingTotal} futuri</Badge>
          </div>
        </Col>
        <Col md={4} className="text-end">
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="me-2"
          >
            {refreshing ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <i className="fas fa-sync-alt"></i>
            )}
          </Button>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={goToToday}
            className="me-2"
          >
            <i className="fas fa-calendar-day me-1"></i>
            Oggi
          </Button>
          <Button 
            variant="primary"
            onClick={() => navigate('/appointment/new')}
          >
            <i className="fas fa-plus me-2"></i>
            Nuovo
          </Button>
        </Col>
      </Row>

      {/* 🎉 MESSAGGI DI SUCCESSO/INFO */}
      {locationMessage && (
        <Alert 
          variant={messageType} 
          dismissible 
          onClose={() => setLocationMessage("")}
          className="mb-3"
        >
          <i className={`fas fa-${messageType === 'success' ? 'check-circle' : 'info-circle'} me-2`}></i>
          {locationMessage}
        </Alert>
      )}

      {/* 🚨 ERRORI */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* ⏰ PROSSIMO APPUNTAMENTO */}
      {calendarStats.nextAppointment && (
        <Alert variant="info" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <i className="fas fa-clock me-2"></i>
              <strong>Prossimo appuntamento:</strong>{" "}
              {calendarStats.nextAppointment.title} -{" "}
              {new Date(calendarStats.nextAppointment.date).toLocaleDateString("it-IT")}{" "}
              alle {calendarStats.nextAppointment.time}
            </div>
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => navigate(`/appointment/edit/${calendarStats.nextAppointment._id}`)}
            >
              Modifica
            </Button>
          </div>
        </Alert>
      )}

      {/* 🗓️ CONTROLLI NAVIGAZIONE MESE */}
      <Card className="mb-4">
        <Card.Body className="py-3">
          <div className="d-flex justify-content-between align-items-center">
            <Button 
              variant="outline-primary" 
              onClick={handlePrevMonth}
              disabled={loading}
            >
              <i className="fas fa-chevron-left"></i>
            </Button>
            
            <div className="text-center">
              <h3 className="mb-0">
                {monthNames[month]} {year}
              </h3>
              <small className="text-muted">
                Ultimo aggiornamento: {new Date(lastUpdate).toLocaleTimeString("it-IT")}
              </small>
            </div>
            
            <Button 
              variant="outline-primary" 
              onClick={handleNextMonth}
              disabled={loading}
            >
              <i className="fas fa-chevron-right"></i>
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* 📅 COMPONENTE CALENDARIO */}
      <div className="position-relative">
        {refreshing && (
          <div className="position-absolute top-0 end-0 p-2" style={{ zIndex: 10 }}>
            <Spinner animation="border" size="sm" variant="primary" />
          </div>
        )}
        
        <Calendar
          year={year}
          month={month}
          appointments={calendarStats.appointmentsForMonth}
          isAdmin={isAdmin}
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate}
        />
      </div>

      {/* 📊 STATISTICHE RAPIDE */}
      <Row className="mt-4">
        <Col md={12}>
          <div className="text-center text-muted">
            <small>
              {calendarStats.appointmentsForMonth.length > 0 ? (
                <>
                  {calendarStats.appointmentsForMonth.length} appuntament{calendarStats.appointmentsForMonth.length !== 1 ? 'i' : 'o'} in {monthNames[month].toLowerCase()} • 
                  Aggiornamento automatico ogni 90 secondi
                </>
              ) : (
                `Nessun appuntamento in ${monthNames[month].toLowerCase()} • Clicca su un giorno per crearne uno`
              )}
            </small>
          </div>
        </Col>
      </Row>

      {/* 📱 QUICK ACTIONS MOBILE */}
      <div className="d-md-none mt-4">
        <Row className="g-2">
          <Col xs={6}>
            <Button 
              variant="outline-primary" 
              className="w-100"
              onClick={() => navigate('/appointment/new')}
            >
              <i className="fas fa-plus me-1"></i>
              Nuovo
            </Button>
          </Col>
          <Col xs={6}>
            <Button 
              variant="outline-secondary" 
              className="w-100"
              onClick={goToToday}
            >
              <i className="fas fa-calendar-day me-1"></i>
              Oggi
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default CalendarPage;