import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

function Calendar({ year, month, appointments, isAdmin, onDateSelect, selectedDate }) {
  const navigate = useNavigate();

  // 📊 CALCOLI OTTIMIZZATI con useMemo (performance!)
  const calendarData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    // Genera array giorni
    const daysArray = [];
    for (let i = 0; i < firstDay; i++) daysArray.push(null);
    for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);
    while (daysArray.length % 7 !== 0) daysArray.push(null);

    // Raggruppa appuntamenti per giorno (ottimizzato)
    const apptsByDay = {};
    if (appointments && appointments.length) {
      appointments.forEach(app => {
        const dateObj = new Date(app.date);
        const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
        if (!apptsByDay[key]) apptsByDay[key] = [];
        apptsByDay[key].push(app);
      });
    }

    return { daysArray, apptsByDay };
  }, [year, month, appointments]);

  // 📅 HELPER FUNZIONI
  const today = new Date();
  const isToday = (day) =>
    day &&
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  const isSelected = (day) => {
    if (!selectedDate || !day) return false;
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
  };

  // 🎨 COLORE DOT basato su status
  const getDotColor = (appointment) => {
    switch (appointment.status) {
      case 'completed': return 'bg-success-500';
      case 'cancelled': return 'bg-secondary-500';
      case 'scheduled':
      default: return 'bg-primary-500';
    }
  };

  // 🖱️ CLICK HANDLER migliorato
  const handleDayClick = (day, appts) => {
    if (!day) return;

    const clickedDate = new Date(year, month, day);
    
    // Notifica il componente padre della data selezionata
    if (onDateSelect) {
      onDateSelect(clickedDate);
    }

    // Se ci sono appuntamenti, vai al primo
    if (appts.length > 0) {
      navigate(`/appointment/edit/${appts[0]._id}`);
    } else {
      // Se non ci sono appuntamenti, vai alla creazione con data pre-impostata
      const dateString = clickedDate.toISOString().split('T')[0];
      navigate(`/appointment/new?date=${dateString}`);
    }
  };

  return (
    <div className="calendar-container">
      {/* 📅 HEADER GIORNI SETTIMANA */}
      <div className="calendar-header">
        {["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"].map((d, i) => (
          <div className="day-header" key={i}>{d}</div>
        ))}
      </div>

      {/* 📊 GRIGLIA CALENDARIO */}
      <div className="calendar-grid">
        {calendarData.daysArray.map((day, i) => {
          if (!day) {
            return <div className="calendar-day calendar-empty" key={i}></div>;
          }

          const dateKey = `${year}-${month}-${day}`;
          const appts = calendarData.apptsByDay[dateKey] || [];
          
          // 🎨 CLASSI CSS DINAMICHE
          const dayClasses = [
            "calendar-day",
            isToday(day) && "today",
            isSelected(day) && "selected",
            appts.length > 0 && "has-appointments"
          ].filter(Boolean).join(" ");

          return (
            <div
              key={i}
              className={dayClasses}
              onClick={() => handleDayClick(day, appts)}
              title={
                appts.length > 0 
                  ? `${appts.length} appuntament${appts.length > 1 ? 'i' : 'o'} - Clicca per vedere`
                  : 'Clicca per creare un appuntamento'
              }
            >
              {/* 🔢 NUMERO GIORNO */}
              <div className="day-number">{day}</div>
              
              {/* 🎯 INDICATORI APPUNTAMENTI */}
              <div className="appointments-indicator">
                {/* Mostra max 3 dot */}
                {appts.slice(0, 3).map((appt, idx) => (
                  <div
                    key={appt._id || idx}
                    className={`appointment-dot ${getDotColor(appt)}`}
                    title={`📅 ${new Date(appt.date).toLocaleDateString("it-IT")} ⏰ ${appt.time}\n🔔 ${appt.title}\n📊 Status: ${appt.status || 'scheduled'}`}
                  ></div>
                ))}
                
                {/* Indicatore per appuntamenti extra */}
                {appts.length > 3 && (
                  <span className="more-appointments" title={`Altri ${appts.length - 3} appuntamenti`}>
                    +{appts.length - 3}
                  </span>
                )}
              </div>

              {/* 🎯 BADGE SPECIALI */}
              <div className="day-badges">
                {isToday(day) && (
                  <span className="badge-today" title="Oggi">
                    •
                  </span>
                )}
                {appts.length > 0 && (
                  <span className="badge-count" title={`${appts.length} appuntamenti`}>
                    {appts.length}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 📊 STATISTICHE RAPIDE (se ci sono appuntamenti) */}
      {appointments && appointments.length > 0 && (
        <div className="mt-4 text-center">
          <small className="text-gray-500 dark:text-gray-400">
            {appointments.length} appuntament{appointments.length !== 1 ? 'i' : 'o'} in questo mese
            {appointments.filter(a => a.status === 'completed').length > 0 && 
              ` • ${appointments.filter(a => a.status === 'completed').length} completat${appointments.filter(a => a.status === 'completed').length !== 1 ? 'i' : 'o'}`
            }
          </small>
        </div>
      )}
    </div>
  );
}

export default Calendar;