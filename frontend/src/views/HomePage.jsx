import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorCard from "./DoctorCard"; // ✅ Import del DoctorCard separato

function HomePage() {
  const navigate = useNavigate(); // ✅ Navigazione reale
  const isLogged = !!localStorage.getItem("token"); // ✅ CORRETTO - non più hardcoded!
  
  // Stati per la ricerca esami e medici
  const [prestazione, setPrestazione] = useState("");
  const [data, setData] = useState("");
  const [specializzazione, setSpecializzazione] = useState("");
  const [citta, setCitta] = useState("");
  
  // Stato per mostrare i risultati della ricerca
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handler per la ricerca esami - ora mostra i DoctorCard
  const handlePrestazioneSubmit = (e) => {
    e.preventDefault();
    const query = prestazione.trim() || "Tutte le prestazioni";
    setSearchQuery(`Risultati per: ${query}${data ? ` - Data: ${data}` : ''}`);
    setShowResults(true);
  };

  // Handler per la ricerca medici
  const handleMediciSubmit = () => {
    const queryParts = [];
    if (specializzazione?.trim()) queryParts.push(specializzazione.trim());
    if (citta?.trim()) queryParts.push(citta.trim());
    
    const query = queryParts.length > 0 ? queryParts.join(', ') : "Tutti i medici";
    setSearchQuery(`Risultati per: ${query}`);
    setShowResults(true);
  };

  // Handler per tornare alla homepage
  const handleBackToHome = () => {
    setShowResults(false);
    setPrestazione("");
    setData("");
    setSpecializzazione("");
    setCitta("");
    setSearchQuery("");
  };

  // Handler per la navigazione
  const handleNavigation = (path) => {
    navigate(path); // ✅ Navigazione reale
  };

  // Dati di esempio per i dottori
  const sampleDoctors = [
    {
      _id: "1",
      name: "Dr. Mario Rossi",
      speciality: "Cardiologo",
      image: "dott.rossi.jpg",
      availability: ["21/01", "22/01", "23/01", "24/01", "25/01"]
    },
    {
      _id: "2", 
      name: "Dr.ssa Sofia Bianchi",
      speciality: "Dermatologa",
      image: "dott.sa.jpg",
      availability: ["21/01", "", "23/01", "24/01", "25/01"]
    },
    {
      _id: "3",
      name: "Dr. Lucia Verdi",
      speciality: "Neurologo", 
      image: "default",
      availability: ["21/01", "22/01", "", "24/01", "25/01"]
    }
  ];

  const features = [
    {
      icon: "fas fa-calendar-check",
      title: "Prenotazione Facile",
      description: "Prenota i tuoi appuntamenti in pochi click, senza stress né attese telefoniche."
    },
    {
      icon: "fas fa-clock",
      title: "Gestione Orari",
      description: "Visualizza tutti i tuoi appuntamenti in un calendario intuitivo e ben organizzato."
    },
    {
      icon: "fas fa-bell",
      title: "Promemoria Email",
      description: "Ricevi notifiche automatiche per non dimenticare mai un appuntamento importante."
    },
    {
      icon: "fas fa-mobile-alt",
      title: "Accesso Ovunque",
      description: "Gestisci i tuoi appuntamenti da qualsiasi dispositivo, sempre sincronizzato."
    },
    {
      icon: "fas fa-user-shield",
      title: "Sicurezza Totale",
      description: "I tuoi dati sono protetti con le migliori tecnologie di sicurezza disponibili."
    },
    {
      icon: "fas fa-chart-line",
      title: "Statistiche Utili",
      description: "Monitora le tue abitudini e ottimizza la gestione del tuo tempo."
    }
  ];

  // Stili personalizzati
  const styles = `
    .hero-section {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;
    }
    
    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><circle cx="200" cy="200" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="500" cy="100" r="3" fill="rgba(255,255,255,0.1)"/><circle cx="800" cy="300" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="300" cy="600" r="4" fill="rgba(255,255,255,0.1)"/><circle cx="700" cy="700" r="2" fill="rgba(255,255,255,0.1)"/></svg>');
      animation: float 20s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(50px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fadeIn {
      animation: fadeIn 1s ease-out;
    }

    .animate-slideUp {
      animation: slideUp 0.8s ease-out forwards;
      opacity: 0;
    }

    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      animation: slideUp 0.8s ease-out forwards;
      opacity: 0;
    }

    .feature-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    .feature-icon {
      width: 4rem;
      height: 4rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: white;
      font-size: 1.5rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .dark .feature-card {
      background: #1f2937;
      color: #f9fafb;
    }
  `;

  if (showResults) {
    return (
      <>
        <style>{styles}</style>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8">
              <button
                onClick={handleBackToHome}
                className="mb-4 flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Torna alla ricerca
              </button>
              
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Trova il tuo Medico
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {sampleDoctors.length} medici trovati
              </div>
            </div>
            
            {/* ✅ USA IL DOCTORCARD SEPARATO - non più integrato */}
            <div className="space-y-6">
              {sampleDoctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen">
        <section className="hero-section">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeIn">
                Prenota{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
                  Esami e Visite
                </span>{" "}
                Online
              </h1>
              
              <div className="text-xl md:text-2xl mb-8 text-white/90">
                <div className="animate-pulse">
                  "Semplice, veloce e sempre a portata di mano"
                </div>
              </div>

              <p className="text-lg md:text-xl mb-10 text-white/80 max-w-2xl mx-auto">
                Prenota le tue visite mediche e gli esami diagnostici in modo semplice e veloce, 
                senza code o attese.
              </p>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-5xl mx-auto mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <i className="fas fa-stethoscope text-blue-600 mr-2"></i>
                      Cerca Prestazioni
                    </h3>
                    <form onSubmit={handlePrestazioneSubmit} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                          placeholder="Es. Ecografia, Risonanza magnetica..."
                          value={prestazione}
                          onChange={(e) => setPrestazione(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <input
                          type="date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800"
                          value={data}
                          onChange={(e) => setData(e.target.value)}
                        />
                      </div>
                      
                      <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <i className="fas fa-search mr-2"></i>
                        Cerca Prestazioni
                      </button>
                    </form>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <i className="fas fa-user-md text-green-600 mr-2"></i>
                      Trova Medici
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                          placeholder="Es. Cardiologo, Dermatologo..."
                          value={specializzazione}
                          onChange={(e) => setSpecializzazione(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                          placeholder="Città o zona..."
                          value={citta}
                          onChange={(e) => setCitta(e.target.value)}
                        />
                      </div>
                      
                      <button 
                        onClick={handleMediciSubmit}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <i className="fas fa-user-md mr-2"></i>
                        Cerca Medici
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {!isLogged ? (
                  <>
                    <button 
                      onClick={() => handleNavigation("/register")}
                      className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <i className="fas fa-rocket mr-2"></i>
                      Inizia Gratis
                    </button>
                    <button 
                      onClick={() => handleNavigation("/login")}
                      className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold transition-all duration-300"
                    >
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Accedi
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleNavigation("/dashboard")}
                    className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Vai alla Dashboard
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
                <div className="animate-slideUp">
                  <div className="text-4xl font-bold text-white">10K+</div>
                  <div className="text-white/80">Appuntamenti Gestiti</div>
                </div>
                <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
                  <div className="text-4xl font-bold text-white">99.9%</div>
                  <div className="text-white/80">Uptime Garantito</div>
                </div>
                <div className="animate-slideUp" style={{ animationDelay: '0.4s' }}>
                  <div className="text-4xl font-bold text-white">24/7</div>
                  <div className="text-white/80">Supporto Disponibile</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Servizio Medico
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Consulti medici disponibili 24/7 per le tue urgenze sanitarie
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-user-md text-2xl text-white"></i>
                  </div>
                  <h4 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    Pronto <span className="text-gray-900 dark:text-gray-100">Dottore</span>
                    <span className="text-lg text-gray-500 ml-2">h24</span>
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Hai bisogno urgente di parlare con un medico?
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-start">
                      <i className="fas fa-check-circle text-green-500 mr-3"></i>
                      <span className="text-gray-700 dark:text-gray-300">Consulto entro 30 minuti</span>
                    </div>
                    <div className="flex items-center justify-start">
                      <i className="fas fa-check-circle text-green-500 mr-3"></i>
                      <span className="text-gray-700 dark:text-gray-300">Disponibile 12/7</span>
                    </div>
                    <div className="flex items-center justify-start">
                      <i className="fas fa-check-circle text-green-500 mr-3"></i>
                      <span className="text-gray-700 dark:text-gray-300">Anche nei festivi</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleNavigation("/doctors")}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Come funziona
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-baby text-2xl text-white"></i>
                  </div>
                  <h4 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    Pronto <span className="text-gray-900 dark:text-gray-100">Pediatra</span>
                    <span className="text-lg text-gray-500 ml-2">h24</span>
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Hai bisogno del consiglio di un pediatra?
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-start">
                      <i className="fas fa-check-circle text-green-500 mr-3"></i>
                      <span className="text-gray-700 dark:text-gray-300">Consulto entro 30 minuti</span>
                    </div>
                    <div className="flex items-center justify-start">
                      <i className="fas fa-check-circle text-green-500 mr-3"></i>
                      <span className="text-gray-700 dark:text-gray-300">Disponibile 12/7</span>
                    </div>
                    <div className="flex items-center justify-start">
                      <i className="fas fa-check-circle text-green-500 mr-3"></i>
                      <span className="text-gray-700 dark:text-gray-300">Anche nei festivi</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleNavigation("/doctors")}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Come funziona
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Perché scegliere EasyCare?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Tutte le funzionalità di cui hai bisogno per una gestione degli appuntamenti 
                senza stress e completamente digitale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="feature-card group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="feature-icon group-hover:scale-110 transition-transform duration-300">
                    <i className={feature.icon}></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {!isLogged && (
          <section className="py-20 bg-gradient-to-r from-primary-500 to-purple-600 text-white">
            <div className="container mx-auto px-4 text-center">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold mb-6">
                  Inizia oggi stesso a organizzare meglio il tuo tempo
                </h2>
                <p className="text-xl mb-8 text-white/90">
                  Unisciti a migliaia di utenti che hanno già semplificato la gestione 
                  dei loro appuntamenti con la nostra piattaforma.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => handleNavigation("/register")}
                    className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <i className="fas fa-user-plus mr-2"></i>
                    Registrati Ora
                  </button>
                  <button 
                    onClick={() => handleNavigation("/login")}
                    className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 font-semibold transition-all duration-300"
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Ho già un account
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8">
                Sicurezza e Affidabilità
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
                <div className="flex flex-col items-center">
                  <i className="fas fa-lock text-4xl text-primary-500 mb-3"></i>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Crittografia SSL
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <i className="fas fa-shield-alt text-4xl text-green-500 mb-3"></i>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    GDPR Compliant
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <i className="fas fa-cloud text-4xl text-blue-500 mb-3"></i>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Backup Automatico
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <i className="fas fa-headset text-4xl text-purple-500 mb-3"></i>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Supporto 24/7
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-calendar-check text-white"></i>
                  </div>
                  <span className="text-2xl font-bold">EasyCare</span>
                </div>
                <p className="text-gray-400 mb-4 max-w-md">
                  La soluzione definitiva per la gestione professionale degli appuntamenti. 
                  Semplice, veloce e sempre affidabile.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <i className="fab fa-facebook-f text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <i className="fab fa-twitter text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <i className="fab fa-linkedin-in text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <i className="fab fa-instagram text-xl"></i>
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Visite Richieste</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Visita Ginecologica</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Visita Cardiologica</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Visita Dermatologica</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Visita Neurologica</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Esami Richiesti</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Ecografia Addome</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">RMN Ginocchio</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">TC Torace</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Mammografia</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2025 EasyCare - P.IVA 01234567890 - info@easycare.it</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default HomePage;