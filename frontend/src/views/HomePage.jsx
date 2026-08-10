import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorCard from "./DoctorCard";
import { isAuthenticated } from "../utils/auth";
import { toDateInputValue } from "../utils/date";

const features = [
  {
    icon: "fas fa-calendar-check",
    title: "Prenotazione semplice",
    description: "Crea e modifica un appuntamento scegliendo data e orario.",
  },
  {
    icon: "fas fa-calendar-alt",
    title: "Calendario personale",
    description: "Consulta gli appuntamenti per mese e controllane lo stato.",
  },
  {
    icon: "fas fa-user-lock",
    title: "Area riservata",
    description: "Accedi con email oppure Google e gestisci soltanto i tuoi dati.",
  },
];

function getUpcomingDays(offsets) {
  return offsets.map((offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return {
      value: toDateInputValue(date),
      label: date.toLocaleDateString("it-IT", { weekday: "short", day: "2-digit", month: "2-digit" }),
    };
  });
}

function getDemoDoctors() {
  return [
    {
      _id: "demo-1",
      name: "Dr. Mario Rossi",
      speciality: "Cardiologia",
      image: "cardiologo",
      availability: getUpcomingDays([1, 2, 3, 4, 5]),
    },
    {
      _id: "demo-2",
      name: "Dr.ssa Sofia Bianchi",
      speciality: "Dermatologia",
      image: "dermatologa",
      availability: getUpcomingDays([1, 3, 4, 5, 7]),
    },
    {
      _id: "demo-3",
      name: "Dr.ssa Lucia Verdi",
      speciality: "Neurologia",
      image: "default",
      availability: getUpcomingDays([2, 3, 5, 6, 7]),
    },
  ];
}

function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState(null);
  const doctors = useMemo(getDemoDoctors, []);

  const results = useMemo(() => {
    if (submittedSearch === null) return [];
    const query = submittedSearch.toLowerCase();
    if (!query) return doctors;
    return doctors.filter((doctor) =>
      `${doctor.name} ${doctor.speciality}`.toLowerCase().includes(query),
    );
  }, [doctors, submittedSearch]);

  const handleSearch = (event) => {
    event.preventDefault();
    setSubmittedSearch(search.trim());
  };

  if (submittedSearch !== null) {
    return (
      <main className="min-h-screen bg-gray-50 py-10 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4">
          <button type="button" onClick={() => setSubmittedSearch(null)} className="mb-6 text-blue-600 hover:text-blue-700">
            <i className="fas fa-arrow-left mr-2" />Torna alla ricerca
          </button>
          <div className="mb-8">
            <span className="badge badge-primary mb-3 inline-flex">Dati dimostrativi</span>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Medici disponibili</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {submittedSearch ? `Ricerca: “${submittedSearch}”` : "Tutte le specializzazioni"}
            </p>
          </div>

          {results.length > 0 ? (
            <div className="space-y-6">
              {results.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} />)}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="text-gray-600 dark:text-gray-400">Nessun profilo dimostrativo corrisponde alla ricerca.</p>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="hero-section">
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            <span className="mb-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
              Progetto portfolio full stack
            </span>
            <h1 className="mb-6 text-5xl font-bold md:text-7xl">
              Prenota visite e gestisci i tuoi appuntamenti
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 md:text-xl">
              Una demo React, Express e MongoDB con autenticazione, calendario e operazioni CRUD.
            </p>

            <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-4 shadow-2xl sm:flex-row">
              <label className="sr-only" htmlFor="doctor-search">Cerca medico o specializzazione</label>
              <input
                id="doctor-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Es. cardiologia o dermatologia"
                className="form-control flex-1 text-gray-900"
              />
              <button type="submit" className="btn btn-primary px-6">
                <i className="fas fa-search" />Cerca nella demo
              </button>
            </form>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {isAuthenticated() ? (
                <button type="button" onClick={() => navigate("/dashboard")} className="btn bg-white px-6 py-3 text-blue-700 hover:bg-blue-50">
                  Vai alla dashboard
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => navigate("/register")} className="btn bg-white px-6 py-3 text-blue-700 hover:bg-blue-50">
                    Prova la demo
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
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Funzioni principali</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Una presentazione trasparente delle funzioni realmente implementate.</p>
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
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">I medici, le disponibilità e le immagini mostrati nella demo sono dati di esempio.</p>
      </footer>
    </main>
  );
}

export default HomePage;
