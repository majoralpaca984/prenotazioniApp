// src/views/Search/DoctorCard.jsx
import { Card, Button, Col, Row } from "react-bootstrap";
import "../style/DoctorCard.css"; 

const DoctorCard = ({ doctor }) => {
  const weekDays = [
    { label: "Lunedì", short: "lun" },
    { label: "Martedì", short: "mar" },
    { label: "Mercoledì", short: "mer" },
    { label: "Giovedì", short: "gio" },
    { label: "Venerdì", short: "ven" },
    { label: "Sabato", short: "sab" },
  ];

  return (
    <Col md={12} className="mb-4">
      <Card className="doctor-card shadow-sm">
        <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-start">
          {/* Sezione Sinistra */}
          <div className="d-flex flex-column align-items-start mb-3 mb-md-0" style={{ minWidth: "250px" }}>
            <div className="d-flex align-items-center mb-2">
              <img
                src={doctor.image || "/default-doctor.jpg"}
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
            <Button
              variant="primary"
              className="mt-3"
              href="/login"
            >
              PRENOTA APPUNTAMENTO
            </Button>
          </div>

          {/* Sezione Orari */}
          <div className="availability-grid">
            {weekDays.map((day, index) => (
              <div key={index} className="day-column">
                <div className="day-header">{day.label}</div>
                <div className="day-date">{doctor.availability?.[index] || "-"}</div>
                {/* Slot orari statici per esempio */}
                {doctor.availability?.[index] && (
                  <>
                    <div className="time-slot">10:20</div>
                    <div className="time-slot">10:40</div>
                    <div className="time-slot">11:00</div>
                    <div className="time-slot">11:20</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default DoctorCard;
