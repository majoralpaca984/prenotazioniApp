// src/views/CalendarPage.jsx
import React, { useState, useEffect } from "react";
import Calendar from "../components/Calendar";

// Utility per ruolo utente (puoi modularizzare dove preferisci)
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

  // Carica appuntamenti (tutti) dal backend
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/appointments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Errore fetch appuntamenti");
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Filtro appuntamenti solo per il mese e anno visualizzati!
  const appointmentsForMonth = appointments.filter(app => {
    const appDate = new Date(app.date);
    return appDate.getFullYear() === year && appDate.getMonth() === month;
  });

  const handlePrevMonth = () => {
    setMonth(prev => (prev === 0 ? 11 : prev - 1));
    if (month === 0) setYear(y => y - 1);
  };

  const handleNextMonth = () => {
    setMonth(prev => (prev === 11 ? 0 : prev + 1));
    if (month === 11) setYear(y => y + 1);
  };

  const monthNames = [
    "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
    "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"
  ];

  // Ruolo admin
  const isAdmin = getUserRole() === "admin";

  return (
    <div>
      <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
        <button className="btn btn-secondary" onClick={handlePrevMonth}>{"<"}</button>
        <h4 className="mb-0">{monthNames[month]} {year}</h4>
        <button className="btn btn-secondary" onClick={handleNextMonth}>{">"}</button>
      </div>
      {loading ? (
        <div className="text-center my-5">Caricamento...</div>
      ) : (
        <Calendar
          year={year}
          month={month}
          appointments={appointmentsForMonth}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

export default CalendarPage;
