import React from "react";
import { useNavigate } from "react-router-dom";

// Mappa delle immagini - sostituisci con i tuoi import
const doctorImages = {
  "dott.rossi.jpg": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
  "dott.sa.jpg": "https://images.unsplash.com/photo-1594824483286-e3e50e1fff8a?w=200&h=200&fit=crop&crop=face",
  "default": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face"
};

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();
  const isLogged = !!localStorage.getItem("token"); // ✅ Esattamente come il tuo originale!
  const weekDays = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];

  // ✅ Logica IDENTICA al tuo file originale
  const handleSlotClick = (date, time) => {
    if (!isLogged) {
      navigate("/login");
    } else {
      navigate(`/appointment/new?doctor=${doctor._id}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`);
    }
  };

  // ✅ Stesso bottone "Prenota Appuntamento" del tuo originale
  const handleBookAppointment = () => {
    if (!isLogged) {
      navigate("/login");
    } else {
      navigate(`/appointment/new?doctor=${doctor._id}`);
    }
  };

  const imageSrc = doctorImages[doctor.image] || doctorImages.default;

  return (
    <div className="w-full mb-6">
      {/* Card principale - convertita da Bootstrap a Tailwind */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700">
        
        {/* Layout flex responsive - equivalente al tuo d-flex flex-md-row */}
        <div className="flex flex-col md:flex-row items-start gap-6">
          
          {/* Immagine del dottore - equivalente al tuo me-4 */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <img
              src={imageSrc}
              alt={doctor.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>

          {/* Info + orari - equivalente al tuo flex-grow-1 w-100 */}
          <div className="flex-1 w-full">
            
            {/* Informazioni base */}
            <div className="mb-4">
              <h5 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {doctor.name}
              </h5>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                {doctor.speciality}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <i className="fas fa-map-marker-alt mr-2 text-red-500"></i>
                Roma, Via Roma 1
              </p>
            </div>

            {/* Griglia disponibilità - convertita dal tuo availability-grid */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <i className="fas fa-calendar-alt mr-2 text-green-500"></i>
                Disponibilità
              </h4>
              
              {/* Grid responsive - equivalente alla tua availability-grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {weekDays.map((day, i) => {
                  const date = doctor.availability?.[i];
                  return (
                    <div key={day} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 min-h-[140px] hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                      
                      {/* Day header */}
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {day}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          {date || "-"}
                        </div>
                        
                        {/* Time slots - ✅ IDENTICA logica del tuo originale */}
                        {date && (
                          <div className="space-y-1">
                            {["10:20", "10:40", "11:00", "11:20"].map((time) => (
                              <button
                                key={time}
                                onClick={() => handleSlotClick(date, time)}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 px-2 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium shadow-sm hover:shadow-md cursor-pointer"
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rating e info aggiuntive */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star text-sm"></i>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    4.9 (127 recensioni)
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <i className="fas fa-euro-sign mr-1"></i>
                  €80 visita
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <i className="fas fa-clock text-green-500"></i>
                <span>Prossimo slot: oggi 15:30</span>
              </div>
            </div>

            {/* Bottone Prenota - ✅ IDENTICA logica del tuo originale */}
            <button
              onClick={handleBookAppointment}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <i className="fas fa-calendar-plus mr-2"></i>
              Prenota Appuntamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;