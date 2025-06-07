// src/views/Search/DoctorCard.jsx
import { Card, Button, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../style/DoctorCard.css";

// ✅ Import immagini dai tuoi asset
import dottRossi from "../../assets/dott.rossi.jpg";
import dottSa from "../../assets/dott.sa.jpg";

// ✅ Mappa immagine -> file importato
const doctorImages = {
  "dott.rossi.jpg": dottRossi,
  "dott.sa.jpg": dottSa,
};

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  const weekDays = [
    { label: "Lunedì", short: "lun" },
    { label: "Martedì", short: "mar" },
    { label: "Mercoledì", short: "mer" },
    { label: "Giovedì", short: "gio" },
    { label: "Venerdì", short: "ven" }
  ];

  const handleSlotClick = (date, time) => {
    navigate(`/booking/${doctor._id}?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`);
  };

  // ✅ Determina l'immagine corretta da mostrare
  const imageSrc = doctorImages[doctor.image] || "/default-doctor.jpg";

  return (
    <Col md={12} className="mb-4">
      <Card className="doctor-card shadow-sm">
        <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-start">
          {/* Sezione Sinistra */}
          <div className="d-flex flex-column align-items-start mb-3 mb-md-0" style={{ minWidth: "250px" }}>
            <div className="d-flex align-items-center mb-2">
              <img
                src={imageSrc}
                alt={doctor.name}
                className="rounded-circle me-3"
                style={{ width: 60, height: 60, objectFit: "cover" }}
              />
              <div>
                <h5 className="mb-0 fw-bold text-primary">{doctor.name}</h5>
                <div className="text-muted small">{doctor.speciality}</div>
              </div>
            </div>
            <div className="text-muted small">
              <i className="fas fa-map-marker-alt me-2"></i>
              Via Roma 1, 00100 Roma
            </div>
            <div className="text-muted small mt-1">
              <i className="fas fa-stethoscope me-2"></i>
              Prima visita (nuovo paziente)
            </div>
            <Button variant="primary" className="mt-3" href="/login">
              PRENOTA APPUNTAMENTO
            </Button>
          </div>

          {/* Sezione Orari */}
          <div className="availability-grid">
            {weekDays.map((day, index) => {
              const date = doctor.availability?.[index];
              return (
                <div key={index} className="day-column">
                  <div className="day-header">{day.label}</div>
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
        </Card.Body>
      </Card>
    </Col>
  );
};

export default DoctorCard;
