import React from "react";
import { useNavigate } from "react-router-dom";

function Calendar({ year, month, appointments, isAdmin }) {
  const navigate = useNavigate();

  // Calcola i giorni del mese e il primo giorno della settimana
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  // Crea l'array dei giorni con offset iniziale
  const daysArray = [];
  for (let i = 0; i < firstDay; i++) daysArray.push(null);
  for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);
  while (daysArray.length % 7 !== 0) daysArray.push(null);

  // Raggruppa gli appuntamenti per giorno
  const apptsByDay = {};
  if (appointments && appointments.length) {
    appointments.forEach(app => {
      const d = new Date(app.date).getDate();
      if (!apptsByDay[d]) apptsByDay[d] = [];
      apptsByDay[d].push(app);
    });
  }

  // Evidenzia il giorno attuale
  const today = new Date();
  const isToday = (day) =>
    day &&
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
          <div className="day-header" key={i}>{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {daysArray.map((day, i) =>
          day ? (
            <div
              key={i}
              className={`calendar-day${isToday(day) ? " today" : ""}${
                apptsByDay[day] ? " has-appointments" : ""
              }`}
            >
              <div className="day-number">{day}</div>
              <div className="appointments-indicator">
                {(apptsByDay[day] || []).map((appt, idx) => (
                  <div
                    className="appt-badge"
                    key={idx}
                    title={appt.title}
                    onClick={() => navigate(`/appointment/edit/${appt._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {isAdmin ? (
                      <>
                        <i className="fa-solid fa-user me-1 text-primary"></i>
                        {appt.title || "Senza titolo"}
                      </>
                    ) : (
                      appt.title || "Senza titolo"
                    )}
                  </div>
                ))}

                {apptsByDay[day] && apptsByDay[day].length > 4 && (
                  <span className="more-appointments">
                    +{apptsByDay[day].length - 4}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="calendar-day calendar-empty" key={i}></div>
          )
        )}
      </div>
    </div>
  );
}

export default Calendar;
