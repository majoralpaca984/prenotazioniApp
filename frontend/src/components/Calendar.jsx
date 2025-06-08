import React from "react";
import { useNavigate } from "react-router-dom";
import "./theme.css";

function Calendar({ year, month, appointments, isAdmin }) {
  const navigate = useNavigate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const daysArray = [];
  for (let i = 0; i < firstDay; i++) daysArray.push(null);
  for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);
  while (daysArray.length % 7 !== 0) daysArray.push(null);

  const apptsByDay = {};
  if (appointments && appointments.length) {
    appointments.forEach(app => {
      const dateObj = new Date(app.date);
      const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
      if (!apptsByDay[key]) apptsByDay[key] = [];
      apptsByDay[key].push(app);
    });
  }

  const today = new Date();
  const isToday = (day) =>
    day &&
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        {["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"].map((d, i) => (
          <div className="day-header" key={i}>{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {daysArray.map((day, i) => {
          if (!day) return <div className="calendar-day calendar-empty" key={i}></div>;

          const dateKey = `${year}-${month}-${day}`;
          const appts = apptsByDay[dateKey] || [];

          return (
            <div
              key={i}
              className={`calendar-day rounded shadow-sm p-2 position-relative transition ${
                isToday(day) ? "today" : ""
              } ${appts.length ? "has-appointments" : ""}`}
              onClick={() => appts.length && navigate(`/appointment/edit/${appts[0]._id}`)}
            >
              <div className="day-number fw-bold">{day}</div>
              <div className="appointments-indicator mt-2">
                {appts.slice(0, 3).map((appt, idx) => (
                  <div
                    className="badge bg-primary-subtle text-primary-emphasis mb-1 w-100 text-truncate appt-pill"
                    key={idx}
                    title={`📅 ${new Date(appt.date).toLocaleDateString("it-IT")} ⏰ ${appt.time}`}
                  >
                    {isAdmin ? `👤 ${appt.title}` : appt.title || "(Senza titolo)"}
                  </div>
                ))}

                {appts.length > 3 && (
                  <div className="text-muted small text-end">+{appts.length - 3} altro</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
