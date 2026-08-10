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
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500" />
      <div className="flex flex-col gap-6 p-5 md:flex-row md:p-6">
        <img
          src={image}
          alt={`Foto dimostrativa di ${doctor.name}`}
          className="mx-auto h-28 w-28 rounded-xl object-cover shadow-sm md:mx-0 md:h-32 md:w-32"
        />

        <div className="min-w-0 flex-1">
          <span className="badge badge-primary mb-3 inline-flex">Profilo dimostrativo</span>
          <h3 className="text-2xl font-bold text-gray-950 dark:text-white">{doctor.name}</h3>
          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>{doctor.speciality}</span>
            {doctor.city && <span>• {doctor.city}</span>}
            {doctor.rating && <span>• {doctor.rating}/5</span>}
            {doctor.price && <span>• da €{doctor.price}</span>}
          </div>

          {doctor.services?.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {doctor.services.map((service) => (
                <span key={service} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {service}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {doctor.availability.map((day) => (
              <div key={day.value} className="rounded-lg border border-gray-200 p-3 text-center dark:border-gray-700">
                <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{day.label}</p>
                {day.available ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => openBooking(day.value, time)}
                        className="rounded-md bg-teal-50 px-2 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-600 hover:text-white"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="py-5 text-xs text-gray-400">Non disponibile</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
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
