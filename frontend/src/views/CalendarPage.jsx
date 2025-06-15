import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import Calendar from "../components/Calendar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function CalendarPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const location = useLocation();

  // 🎉 MOSTRA MESSAGGIO DI SUCCESSO dal form
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setMessageType(location.state.type || "success");
      
      // Rimuovi il messaggio dopo 5 secondi
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // 🔄 FETCH APPOINTMENTS con callback ottimizzato
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token non trovato");
      }

      const response = await fetch(`${API_URL}/appointments`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error("❌ Errore fetch appointments:", err);
      setError("Errore nel caricamento degli appuntamenti");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 CARICAMENTO INIZIALE
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // 👂 ASCOLTA CAMBIAMENTI da AppointmentForm
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'appointment_updated') {
        console.log('🔄 Calendar: Rilevato cambiamento appuntamento');
        fetchAppointments();
        localStorage.removeItem('appointment_updated'); // Cleanup
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchAppointments]);

  // 📅 NAVIGAZIONE MESE
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // 🎯 GESTIONE SELEZIONE DATA
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // 📊 FILTRA APPUNTAMENTI per il mese corrente
  const currentMonthAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return (
      appointmentDate.getFullYear() === currentDate.getFullYear() &&
      appointmentDate.getMonth() === currentDate.getMonth()
    );
  });

  // 📈 STATISTICHE RAPIDE
  const stats = {
    total: currentMonthAppointments.length,
    completed: currentMonthAppointments.filter(a => a.status === 'completed').length,
    scheduled: currentMonthAppointments.filter(a => a.status === 'scheduled').length,
    cancelled: currentMonthAppointments.filter(a => a.status === 'cancelled').length,
  };

  const monthName = currentDate.toLocaleDateString("it-IT", { 
    month: "long", 
    year: "numeric" 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Caricamento calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🎉 MESSAGGIO DI SUCCESSO */}
      {message && (
        <div className={`alert ${messageType === 'success' ? 'alert-success' : messageType === 'info' ? 'alert-info' : 'alert-danger'} animate-slideUp`}>
          <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : messageType === 'info' ? 'fa-info-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
          {message}
          <button 
            onClick={() => setMessage("")}
            className="ml-auto text-current hover:opacity-70"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* 🚨 ERRORI */}
      {error && (
        <div className="alert alert-danger">
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

      {/* 📅 HEADER CALENDARIO */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <i className="fas fa-calendar-alt text-primary-500"></i>
            Calendario
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestisci e visualizza tutti i tuoi appuntamenti
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={goToToday}
            className="btn btn-outline-primary"
            title="Vai a oggi"
          >
            <i className="fas fa-calendar-day mr-2"></i>
            Oggi
          </button>
          <Link to="/appointment/new" className="btn btn-primary">
            <i className="fas fa-plus mr-2"></i>
            Nuovo Appuntamento
          </Link>
        </div>
      </div>

      {/* 📊 STATISTICHE RAPIDE */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-primary-500 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Totali</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-blue-500 mb-1">{stats.scheduled}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Programmati</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-success-500 mb-1">{stats.completed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completati</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-secondary-500 mb-1">{stats.cancelled}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Annullati</div>
          </div>
        </div>
      )}

      {/* 🗓️ CONTROLLI NAVIGAZIONE MESE */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <button
          onClick={goToPreviousMonth}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
        >
          <i className="fas fa-chevron-left"></i>
          <span className="hidden sm:inline">Mese Precedente</span>
        </button>

        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 capitalize text-center">
          {monthName}
        </h2>

        <button
          onClick={goToNextMonth}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
        >
          <span className="hidden sm:inline">Mese Successivo</span>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {/* 📅 COMPONENTE CALENDARIO */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <Calendar
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          appointments={currentMonthAppointments}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
      </div>

      {/* 📋 LISTA APPUNTAMENTI DEL MESE (se ci sono) */}
      {currentMonthAppointments.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <i className="fas fa-list"></i>
              Appuntamenti di {monthName}
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentMonthAppointments
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((appointment) => (
                  <div 
                    key={appointment._id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {appointment.title}
                        </h4>
                        <span className={`badge ${
                          appointment.status === 'completed' ? 'badge-success' :
                          appointment.status === 'cancelled' ? 'badge-secondary' :
                          'badge-primary'
                        }`}>
                          {appointment.status || 'scheduled'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-calendar text-primary-500"></i>
                          {new Date(appointment.date).toLocaleDateString("it-IT")}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-clock text-primary-500"></i>
                          {appointment.time}
                        </span>
                      </div>
                      {appointment.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {appointment.description}
                        </p>
                      )}
                    </div>
                    <Link
                      to={`/appointment/edit/${appointment._id}`}
                      className="btn btn-outline-primary btn-sm ml-4"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Modifica
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 📭 STATO VUOTO */}
      {currentMonthAppointments.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <i className="fas fa-calendar-plus text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nessun appuntamento questo mese
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Inizia aggiungendo il tuo primo appuntamento per {monthName.toLowerCase()}.
            </p>
            <Link to="/appointment/new" className="btn btn-primary">
              <i className="fas fa-plus mr-2"></i>
              Crea Primo Appuntamento
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;