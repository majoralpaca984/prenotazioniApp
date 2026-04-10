import React from "react";
import { useNavigate } from "react-router-dom";

const doctorImages = {
  "dott.rossi.jpg": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
  "dott.sa.jpg": "https://images.unsplash.com/photo-1594824483286-e3e50e1fff8a?w=200&h=200&fit=crop&crop=face",
  default: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
};

const timeSlots = ["10:15", "10:30", "10:45", "11:00"];
const weekDays = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();
  const isLogged = !!localStorage.getItem("token");
  const imageSrc = doctorImages[doctor.image] || doctorImages.default;

  const handleSlotClick = (slot, time) => {
    if (!isLogged) {
      navigate("/login");
      return;
    }

    navigate(`/appointment/new?doctor=${doctor._id}&date=${encodeURIComponent(slot.value)}&time=${encodeURIComponent(time)}`);
  };

  const handleBookAppointment = () => {
    navigate(isLogged ? `/appointment/new?doctor=${doctor._id}` : "/login");
  };

  return (
    <div className="w-full mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-rose-500"></div>

        <div className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row items-start gap-5">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-teal-100 dark:bg-teal-900/40"></div>
                <img
                  src={imageSrc}
                  alt={doctor.name}
                  className="relative w-28 h-28 md:w-32 md:h-32 rounded-lg object-cover shadow-sm"
                />
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-5">
                <div>
                  <div className="inline-flex items-center px-3 py-1 mb-3 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-200 text-xs font-semibold">
                    Disponibile questa settimana
                  </div>
                  <h5 className="text-2xl font-bold text-gray-950 dark:text-white mb-1">
                    {doctor.name}
                  </h5>
                  <p className="text-base text-gray-600 dark:text-gray-300 mb-2">
                    {doctor.speciality}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Roma, Via Roma 1
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 text-sm">
                  <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    4.9 su 5
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      127 recensioni
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    80 euro
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      visita specialistica
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    Scegli un orario
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Slot da 15 minuti
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {weekDays.map((day, i) => {
                    const slot = doctor.availability?.[i];

                    return (
                      <div
                        key={day}
                        className={`rounded-lg border p-3 min-h-[142px] transition-colors duration-200 ${
                          slot
                            ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            : "bg-gray-50 dark:bg-gray-800/60 border-dashed border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="text-center mb-3">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {day}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {slot?.label || "Non disponibile"}
                          </div>
                        </div>

                        {slot && (
                          <div className="grid grid-cols-2 gap-1.5">
                            {timeSlots.map((time) => (
                              <button
                                key={time}
                                onClick={() => handleSlotClick(slot, time)}
                                className="rounded-md border border-teal-200 bg-teal-50 hover:bg-teal-600 hover:border-teal-600 text-teal-700 hover:text-white text-xs py-1.5 px-2 transition-colors duration-200 font-semibold"
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Prossimo slot disponibile nella prima data indicata.
                </p>
                <button
                  onClick={handleBookAppointment}
                  className="w-full sm:w-auto bg-gray-950 hover:bg-teal-700 dark:bg-white dark:hover:bg-teal-100 dark:text-gray-950 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm"
                >
                  Prenota appuntamento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
