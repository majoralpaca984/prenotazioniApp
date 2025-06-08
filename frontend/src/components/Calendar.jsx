import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/theme.css";


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
              className={`calendar-day ${isToday(day) ? "today" : ""} ${appts.length ? "has-appointments" : ""}`}
              onClick={() => appts.length && navigate(`/appointment/edit/${appts[0]._id}`)}
            >
              <div className="day-number">{day}</div>
              <div className="appointments-indicator">
                {appts.slice(0, 3).map((appt, idx) => (
                  <div
                    key={idx}
                    className="appointment-dot bg-primary"
                    title={`📅 ${new Date(appt.date).toLocaleDateString("it-IT")} ⏰ ${appt.time} ${appt.title ? "🔔 " + appt.title : ""}`}
                  ></div>
                ))}
                {appts.length > 3 && (
                  <span className="more-appointments">
                    +{appts.length - 3}
                  </span>
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
