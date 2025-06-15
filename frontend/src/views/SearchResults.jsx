import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function SearchResults() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    sortBy: "date"
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 🔍 OTTIENI QUERY DAI PARAMETRI URL
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  // 📊 FETCH TUTTI GLI APPUNTAMENTI
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
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
  };

  // 🔍 FILTRA E CERCA APPUNTAMENTI
  useEffect(() => {
    let filtered = [...appointments];

    // 🔍 RICERCA TESTUALE
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.title.toLowerCase().includes(query) ||
        (apt.description && apt.description.toLowerCase().includes(query))
      );
    }

    // 📊 FILTRO STATUS
    if (filters.status !== "all") {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    // 📅 FILTRO RANGE DATE
    const now = new Date();
    if (filters.dateRange !== "all") {
      switch (filters.dateRange) {
        case "today":
          filtered = filtered.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate.toDateString() === now.toDateString();
          });
          break;
        case "week":
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          filtered = filtered.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= weekStart && aptDate <= weekEnd;
          });
          break;
        case "month":
          filtered = filtered.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate.getMonth() === now.getMonth() && 
                   aptDate.getFullYear() === now.getFullYear();
          });
          break;
        case "future":
          filtered = filtered.filter(apt => new Date(apt.date) >= now);
          break;
        case "past":
          filtered = filtered.filter(apt => new Date(apt.date) < now);
          break;
      }
    }

    // 🔄 ORDINAMENTO
    switch (filters.sortBy) {
      case "date":
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "status":
        filtered.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchQuery, filters]);

  // 🎯 GESTIONE RICERCA
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // 🎨 COLORE BADGE STATUS
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-secondary';
      case 'scheduled':
      default: return 'badge-primary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Caricamento risultati...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🔍 HEADER E RICERCA */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <i className="fas fa-search text-primary-500"></i>
            Cerca Appuntamenti
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {searchQuery ? `Risultati per "${searchQuery}"` : "Trova rapidamente i tuoi appuntamenti"}
          </p>
        </div>
        
        <Link to="/appointment/new" className="btn btn-primary">
          <i className="fas fa-plus mr-2"></i>
          Nuovo Appuntamento
        </Link>
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

      {/* 🔍 BARRA DI RICERCA */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Cerca per titolo o descrizione..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control pl-10"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-search mr-2"></i>
                Cerca
              </button>
            </div>
          </form>

          {/* 🎛️ FILTRI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Stato</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="form-select"
              >
                <option value="all">Tutti gli stati</option>
                <option value="scheduled">Programmati</option>
                <option value="completed">Completati</option>
                <option value="cancelled">Annullati</option>
              </select>
            </div>

            <div>
              <label className="form-label">Periodo</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                className="form-select"
              >
                <option value="all">Tutti i periodi</option>
                <option value="today">Oggi</option>
                <option value="week">Questa settimana</option>
                <option value="month">Questo mese</option>
                <option value="future">Futuri</option>
                <option value="past">Passati</option>
              </select>
            </div>

            <div>
              <label className="form-label">Ordina per</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="form-select"
              >
                <option value="date">Data</option>
                <option value="title">Titolo</option>
                <option value="status">Stato</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 CONTATORE RISULTATI */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <span className="text-gray-600 dark:text-gray-400">
          {filteredAppointments.length === 0 ? (
            "Nessun risultato trovato"
          ) : (
            `${filteredAppointments.length} appuntament${filteredAppointments.length !== 1 ? 'i' : 'o'} trovato`
          )}
        </span>
        
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchParams({});
            }}
            className="text-primary-500 hover:text-primary-600 text-sm font-medium"
          >
            <i className="fas fa-times mr-1"></i>
            Pulisci ricerca
          </button>
        )}
      </div>

      {/* 📋 RISULTATI */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {appointment.title}
                      </h3>
                      <span className={`badge ${getStatusBadge(appointment.status)}`}>
                        {appointment.status || 'scheduled'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-calendar text-primary-500"></i>
                        {new Date(appointment.date).toLocaleDateString("it-IT", {
                          weekday: "long",
                          day: "2-digit", 
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-clock text-primary-500"></i>
                        {appointment.time}
                      </span>
                    </div>
                    
                    {appointment.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {appointment.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      to={`/appointment/edit/${appointment._id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Modifica
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        /* 📭 STATO VUOTO */
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <i className="fas fa-search text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery ? "Nessun risultato trovato" : "Nessun appuntamento"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery ? (
                <>Prova a modificare i termini di ricerca o i filtri.</>
              ) : (
                <>Non hai ancora creato nessun appuntamento.</>
              )}
            </p>
            {!searchQuery && (
              <Link to="/appointment/new" className="btn btn-primary">
                <i className="fas fa-plus mr-2"></i>
                Crea Primo Appuntamento
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResults;