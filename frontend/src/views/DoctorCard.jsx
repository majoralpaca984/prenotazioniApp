// src/views/Search/DoctorCard.jsx
import { Card, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../style/DoctorCard.css";
import dottRossi from "../assets/dott.rossi.jpg";
import dottSa from "../assets/dott.sa.jpg";

// Mappa delle immagini
const doctorImages = {
  "dott.rossi.jpg": dottRossi,
  "dott.sa.jpg": dottSa,
};

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();
  const isLogged = !!localStorage.getItem("token");
  const weekDays = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];

  const handleSlotClick = (date, time) => {
    if (!isLogged) {
      navigate("/login");
    } else {
      navigate(`/appointment/new?doctor=${doctor._id}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`);
    }
  };

  const imageSrc = doctorImages[doctor.image] || "/default-doctor.jpg";

  return (
    <Col md={12} className="mb-4">
      <Card className="doctor-card shadow-sm p-3 d-flex flex-column flex-md-row align-items-start">
        {/* Immagine grande a sinistra */}
        <div className="me-4">
          <img
            src={imageSrc}
            alt={doctor.name}
            className="doctor-image"
            style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover" }}
          />
        </div>

        {/* Info + orari */}
        <div className="flex-grow-1 w-100">
          <h5 className="fw-bold text-primary">{doctor.name}</h5>
          <p className="mb-1 text-muted">{doctor.speciality}</p>
          <p className="text-muted small">
            <i className="fas fa-map-marker-alt me-1"></i> Roma, Via Roma 1
          </p>

          <div className="availability-grid mt-3">
            {weekDays.map((day, i) => {
              const date = doctor.availability?.[i];
              return (
                <div key={day} className="day-column">
                  <div className="day-header">{day}</div>
                  <div className="day-date">{date || "-"}</div>
                  {date &&
                    ["10:20", "10:40", "11:00", "11:20"].map((time) => (
                      <div
                        key={time}
                        className="time-slot"
                        onClick={() => handleSlotClick(date, time)}
                      >
                        {time}
                      </div>
                    ))}
                </div>
              );
            })}
          </div>

          <button
            className="btn btn-primary mt-3"
            onClick={() => {
              if (!isLogged) {
                navigate("/login");
              } else {
                navigate(`/appointment/new?doctor=${doctor._id}`);
              }
            }}
          >
            Prenota Appuntamento
          </button>
        </div>
      </Card>
    </Col>
  );
};

export default DoctorCard;
