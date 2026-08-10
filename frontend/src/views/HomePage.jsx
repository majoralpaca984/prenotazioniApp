import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { demoServices, demoSpecialities } from "../data/demoCatalog";
import { isAuthenticated } from "../utils/auth";
import { toDateInputValue } from "../utils/date";

const features = [
  {
    icon: "fas fa-magnifying-glass",
    title: "Ricerca prestazioni",
    description: "Cerca una visita o un esame e confronta disponibilità dimostrative.",
  },
  {
    icon: "fas fa-calendar-check",
    title: "Prenotazione reale",
    description: "Scegli uno slot e salva l'appuntamento nel tuo account.",
  },
  {
    icon: "fas fa-calendar-alt",
    title: "Calendario personale",
    description: "Consulta, modifica o elimina gli appuntamenti creati.",
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [city, setCity] = useState("");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minimumDate = toDateInputValue(tomorrow);

  const openResults = (params) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value?.trim()),
    );
    navigate(`/search?${query.toString()}`);
  };

  const searchServices = (event) => {
    event.preventDefault();
    openResults({ service, date });
  };

  const searchDoctors = (event) => {
    event.preventDefault();
    openResults({ speciality, city });
  };

  return (
    <main className="min-h-screen">
      <section className="hero-section py-16 md:py-24">
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-5xl">
            <span className="mb-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
              Progetto portfolio full stack
            </span>
            <h1 className="mb-6 text-5xl font-bold md:text-7xl">
              Prenota esami e visite online
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 md:text-xl">
              Cerca una prestazione o uno specialista, scegli un orario e gestisci l'appuntamento dalla tua area personale.
            </p>

            <div className="mx-auto grid max-w-5xl gap-5 rounded-3xl bg-white/95 p-5 text-left shadow-2xl backdrop-blur-sm lg:grid-cols-2">
              <form onSubmit={searchServices} className="rounded-2xl bg-blue-50 p-5">
                <h2 className="mb-4 flex items-center text-xl font-bold text-gray-900">
                  <i className="fas fa-stethoscope mr-3 text-blue-600" />Cerca prestazioni
                </h2>
                <label className="form-label text-gray-800" htmlFor="service-search">Visita o esame</label>
                <input
                  id="service-search"
                  list="demo-services"
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  placeholder="Es. Ecografia, Risonanza magnetica"
                  className="form-control mb-4 bg-white text-gray-900"
                />
                <datalist id="demo-services">
                  {demoServices.map((item) => <option key={item} value={item} />)}
                </datalist>

                <label className="form-label text-gray-800" htmlFor="service-date">A partire dal</label>
                <input
                  id="service-date"
                  type="date"
                  min={minimumDate}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="form-control mb-5 bg-white text-gray-900"
                />
                <button type="submit" className="btn btn-primary w-full">
                  <i className="fas fa-search" />Cerca prestazioni
                </button>
              </form>

              <form onSubmit={searchDoctors} className="rounded-2xl bg-emerald-50 p-5">
                <h2 className="mb-4 flex items-center text-xl font-bold text-gray-900">
                  <i className="fas fa-user-doctor mr-3 text-emerald-600" />Trova medici
                </h2>
                <label className="form-label text-gray-800" htmlFor="speciality-search">Nome o specializzazione</label>
                <input
                  id="speciality-search"
                  list="demo-specialities"
                  value={speciality}
                  onChange={(event) => setSpeciality(event.target.value)}
                  placeholder="Es. Cardiologia, Dermatologia"
                  className="form-control mb-4 bg-white text-gray-900"
                />
                <datalist id="demo-specialities">
                  {demoSpecialities.map((item) => <option key={item} value={item} />)}
                </datalist>

                <label className="form-label text-gray-800" htmlFor="city-search">Città o zona</label>
                <input
                  id="city-search"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Es. Roma, Guidonia"
                  className="form-control mb-5 bg-white text-gray-900"
                />
                <button type="submit" className="btn w-full bg-emerald-600 text-white hover:bg-emerald-700">
                  <i className="fas fa-user-doctor" />Cerca medici
                </button>
              </form>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {isAuthenticated() ? (
                <button type="button" onClick={() => navigate("/dashboard")} className="btn bg-white px-6 py-3 text-blue-700 hover:bg-blue-50">
                  Vai alla dashboard
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => navigate("/register")} className="btn bg-white px-6 py-3 text-blue-700 hover:bg-blue-50">
                    Crea un account
                  </button>
                  <button type="button" onClick={() => navigate("/login")} className="btn border border-white px-6 py-3 text-white hover:bg-white/10">
                    Accedi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Come funziona la demo</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">I dati del catalogo sono esempi; gli appuntamenti creati vengono salvati realmente.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <div className="feature-icon"><i className={feature.icon} /></div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="font-semibold text-gray-900 dark:text-white">EasyCare — progetto dimostrativo</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Medici, prezzi, recensioni e disponibilità sono dati di esempio.</p>
      </footer>
    </main>
  );
}

export default HomePage;
