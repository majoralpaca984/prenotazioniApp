import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const doctorImages = {
  cardiologo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face",
  dermatologa: "https://images.unsplash.com/photo-1594824483286-e3e50e1fff8a?w=300&h=300&fit=crop&crop=face",
  default: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
  radiologo: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face",
};

const timeSlots = ["10:15", "10:30", "10:45", "11:00"];

function DoctorCard({ doctor, requestedService = "" }) {
  const navigate = useNavigate();
  const image = doctorImages[doctor.image] || doctorImages.default;

  const openBooking = (date = "", time = "") => {
    const params = new URLSearchParams({
      doctor: doctor._id,
      title: requestedService
        ? `${requestedService} - ${doctor.name}`
        : `${doctor.speciality} - ${doctor.name}`,
      ...(date ? { date } : {}),
      ...(time ? { time } : {}),
    });
    const bookingPath = `/appointment/new?${params.toString()}`;

    if (!isAuthenticated()) {
      navigate(`/login?redirect=${encodeURIComponent(bookingPath)}`);
      return;
    }

    navigate(bookingPath);
  };

  return (
    <article className="doctor-card">
      <div className="doctor-card-inner">
        <img
          src={image}
          alt={`Foto dimostrativa di ${doctor.name}`}
          loading="lazy"
          className="doctor-photo"
        />

        <div className="doctor-details">
          <span className="eyebrow-label">Profilo dimostrativo</span>
          <h3>{doctor.name}</h3>
          <div className="doctor-meta">
            <span>{doctor.speciality}</span>
            {doctor.city && <span>• {doctor.city}</span>}
            {doctor.rating && <span>• {doctor.rating}/5</span>}
            {doctor.price && <span>• da €{doctor.price}</span>}
          </div>

          {doctor.services?.length > 0 && (
            <div className="doctor-services">
              {doctor.services.map((service) => (
                <span key={service}>
                  {service}
                </span>
              ))}
            </div>
          )}

          <div className="availability-grid">
            {doctor.availability.map((day) => (
              <div key={day.value} className="availability-day">
                <p>{day.label}</p>
                {day.available ? (
                  <div className="time-slots">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => openBooking(day.value, time)}
                        className="time-slot"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="unavailable">Non disponibile</p>
                )}
              </div>
            ))}
          </div>

          <div className="doctor-actions">
            <button type="button" onClick={() => openBooking()} className="btn btn-primary">
              Prenota appuntamento
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default DoctorCard;
