import React, { useState, useEffect, useCallback, useMemo } from "react";
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

// Modal Component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
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

  // 📊 STATISTICHE CALCOLATE con useMemo - METODO CORRETTO
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // ✅ METODO CORRETTO: Confronta solo date, non tempo
    const future = appointments.filter((a) => {
      const appDate = new Date(a.date);
      return appDate >= today;
    });

    const past = appointments.filter((a) => {
      const appDate = new Date(a.date);
      return appDate < today;
    });

    const todayAppts = appointments.filter((a) => {
      const appDate = new Date(a.date);
      return isSameDay(appDate, today);
    });

    const appointmentTomorrow = appointments.find((a) => {
      const appDate = new Date(a.date);
      return isSameDay(appDate, tomorrow);
    });

    return {
      total: appointments.length,
      future: future.length,
      today: todayAppts.length,
      appointmentTomorrow,
      nextAppointment: future.sort((a, b) => new Date(a.date) - new Date(b.date))[0],
      lastAppointment: past.sort((a, b) => new Date(b.date) - new Date(a.date))[0],
      futureList: future.sort((a, b) => new Date(a.date) - new Date(b.date))
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
      isSameDay(new Date(a.date), day)
    );
    setSelectedDayAppointments(found);
    setShowModal(true);
  };

  // 🏃‍♂️ LOADING INIZIALE
  if (loading && appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Caricamento dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <i className="fas fa-tachometer-alt text-primary-500"></i> Dashboard
          </h2>
          <small className="text-gray-500 dark:text-gray-400">
            Ultimo aggiornamento: {new Date(lastUpdate).toLocaleTimeString("it-IT")}
          </small>
        </div>
        <div className="flex items-center gap-3">
          {/* 🔄 PULSANTE REFRESH */}
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline-primary"
            title="Aggiorna dati"
          >
            {refreshing ? (
              <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin"></div>
            ) : (
              <i className="fas fa-sync-alt"></i>
            )}
          </button>
          
          <Link to="/appointment/new" className="btn btn-primary">
            <i className="fas fa-plus"></i>
            <span>Nuovo Appuntamento</span>
          </Link>
        </div>
      </div>

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

      {/* ⏰ APPUNTAMENTO DOMANI */}
      {stats.appointmentTomorrow && (
        <div className="alert alert-warning flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-bell"></i>
            <span>
              Hai un appuntamento <strong>domani</strong> alle {stats.appointmentTomorrow.time} -{" "}
              <strong>{stats.appointmentTomorrow.title}</strong>
            </span>
          </div>
          <button
            onClick={() => navigate(`/appointment/edit/${stats.appointmentTomorrow._id}`)}
            className="btn btn-outline-primary btn-sm"
          >
            Modifica
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* 📊 CARD RIEPILOGO MIGLIORATA */}
        <div className="card h-full">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                📊 Riepilogo
              </h5>
              {refreshing && <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin"></div>}
            </div>
            
            {/* 📈 STATISTICHE VELOCI */}
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <div className="text-2xl font-bold text-primary-500 mb-1">{stats.total}</div>
                <small className="text-gray-600 dark:text-gray-400">Totali</small>
              </div>
              <div>
                <div className="text-2xl font-bold text-success-500 mb-1">{stats.future}</div>
                <small className="text-gray-600 dark:text-gray-400">Futuri</small>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500 mb-1">{stats.today}</div>
                <small className="text-gray-600 dark:text-gray-400">Oggi</small>
              </div>
            </div>

            {/* 🕒 PROSSIMO APPUNTAMENTO */}
            {stats.nextAppointment && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <i className="fas fa-clock text-primary-500"></i>
                  Prossimo:
                </p>
                <div className="ml-6">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{stats.nextAppointment.title}</div>
                  <small className="text-gray-600 dark:text-gray-400">
                    {formatDate(stats.nextAppointment.date)} alle {stats.nextAppointment.time}
                  </small>
                </div>
              </div>
            )}

            {/* ✅ ULTIMO APPUNTAMENTO */}
            {stats.lastAppointment && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <i className="fas fa-check-circle text-success-500"></i>
                  Ultimo:
                </p>
                <div className="ml-6">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{stats.lastAppointment.title}</div>
                  <small className="text-gray-600 dark:text-gray-400">
                    {formatDate(stats.lastAppointment.date)}
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 📅 TIMELINE PROSSIMI APPUNTAMENTI MIGLIORATA */}
        <div className="card h-full">
          <div className="card-body">
            <h5 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              📅 Prossimi Appuntamenti
            </h5>
            {stats.futureList.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-calendar-plus text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Nessun appuntamento futuro</p>
                <Link to="/appointment/new" className="btn btn-primary btn-sm">
                  Prenota ora
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {stats.futureList.slice(0, 5).map((appointment) => (
                  <div 
                    key={appointment._id} 
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer transition-colors"
                    onClick={() => navigate(`/appointment/edit/${appointment._id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {formatDateTime(appointment.date)} alle {appointment.time}
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{appointment.title}</div>
                        {appointment.description && (
                          <small className="text-gray-500 dark:text-gray-400">{appointment.description}</small>
                        )}
                      </div>
                      <span className="badge badge-primary ml-2">
                        {appointment.status || 'scheduled'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* 👀 MOSTRA PIÙ */}
                {stats.futureList.length > 5 && (
                  <div className="text-center mt-4">
                    <Link to="/calendar" className="btn btn-outline-primary btn-sm">
                      Vedi tutti ({stats.futureList.length})
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL GIORNO SELEZIONATO */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Appuntamenti del giorno"
      >
        {selectedDayAppointments.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Nessun appuntamento per questo giorno.</p>
        ) : (
          <div className="space-y-3">
            {selectedDayAppointments.map((a) => (
              <div key={a._id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{a.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{a.time}</div>
                </div>
                <button 
                  onClick={() => {
                    navigate(`/appointment/edit/${a._id}`);
                    setShowModal(false);
                  }}
                  className="btn btn-outline-primary btn-sm"
                >
                  Modifica
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* FOOTER FISSO MIGLIORATO */}
      <footer className="dashboard-footer">
        <Link to="/" title="Home">
          <i className="fas fa-home"></i>
        </Link>
        <Link to="/calendar" title="Calendario">
          <i className="fas fa-calendar-alt"></i>
        </Link>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          title="Aggiorna"
        >
          <i className={`fas fa-sync-alt ${refreshing ? 'animate-spin' : ''}`}></i>
        </button>
        {/* Da button disabilitato a Link al profilo */}
        <Link to="/profile" title="Il Mio Profilo">
          <i className="fas fa-cog"></i>
        </Link>
      </footer>
    </div>
  );
}

export default Dashboard;