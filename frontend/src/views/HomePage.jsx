import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { demoServices, demoSpecialities } from "../data/demoCatalog";
import { isAuthenticated } from "../utils/auth";
import { toDateInputValue } from "../utils/date";

const features = [
  {
    number: "01",
    icon: "fas fa-magnifying-glass",
    title: "Ricerca prestazioni",
    description: "Cerca una visita o un esame e confronta le disponibilità dimostrative.",
  },
  {
    number: "02",
    icon: "fas fa-calendar-check",
    title: "Prenotazione reale",
    description: "Scegli uno slot e salva l'appuntamento nel tuo account.",
  },
  {
    number: "03",
    icon: "fas fa-calendar-days",
    title: "Calendario personale",
    description: "Consulta, modifica o elimina gli appuntamenti creati.",
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState("services");
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

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchMode === "services") {
      openResults({ service, date });
      return;
    }
    openResults({ speciality, city });
  };

  const tryDemo = () => {
    if (isAuthenticated()) {
      navigate("/dashboard");
      return;
    }
    document.getElementById("prenota")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className="homepage">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="home-eyebrow">Progetto portfolio full stack</p>
          <h1 id="home-title">Prenota esami<br />e visite <em>online.</em></h1>
          <p className="home-lede">
            Cerca una prestazione o uno specialista, scegli l'orario e gestisci l'appuntamento dalla tua area personale.
          </p>

          <form id="prenota" onSubmit={handleSearch} className="home-search-card">
            <div className="search-tabs" role="tablist" aria-label="Tipo di ricerca">
              <button
                type="button"
                role="tab"
                aria-selected={searchMode === "services"}
                className={searchMode === "services" ? "active" : ""}
                onClick={() => setSearchMode("services")}
              >
                <i className="fas fa-stethoscope" />Prestazioni
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={searchMode === "doctors"}
                className={searchMode === "doctors" ? "active" : ""}
                onClick={() => setSearchMode("doctors")}
              >
                <i className="fas fa-user-doctor" />Medici
              </button>
            </div>

            {searchMode === "services" ? (
              <div className="home-search-fields">
                <label>
                  <span className="sr-only">Prestazione</span>
                  <i className="fas fa-magnifying-glass" />
                  <input
                    list="demo-services"
                    value={service}
                    onChange={(event) => setService(event.target.value)}
                    placeholder="Es. ecografia, risonanza magnetica"
                    aria-label="Prestazione"
                  />
                </label>
                <datalist id="demo-services">
                  {demoServices.map((item) => <option key={item} value={item} />)}
                </datalist>
                <label>
                  <span className="sr-only">Data</span>
                  <i className="far fa-calendar" />
                  <input
                    type="date"
                    min={minimumDate}
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    aria-label="Data"
                  />
                </label>
                <button type="submit" className="btn btn-primary">Cerca</button>
              </div>
            ) : (
              <div className="home-search-fields">
                <label>
                  <span className="sr-only">Medico o specializzazione</span>
                  <i className="fas fa-magnifying-glass" />
                  <input
                    list="demo-specialities"
                    value={speciality}
                    onChange={(event) => setSpeciality(event.target.value)}
                    placeholder="Es. cardiologia, dermatologia"
                    aria-label="Medico o specializzazione"
                  />
                </label>
                <datalist id="demo-specialities">
                  {demoSpecialities.map((item) => <option key={item} value={item} />)}
                </datalist>
                <label>
                  <span className="sr-only">Città o zona</span>
                  <i className="fas fa-location-dot" />
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Es. Roma"
                    aria-label="Città o zona"
                  />
                </label>
                <button type="submit" className="btn btn-primary">Cerca</button>
              </div>
            )}
          </form>

          <div className="home-metrics" aria-label="Informazioni sulla demo">
            <p><strong>24</strong><span>specialità</span></p>
            <p><strong>2 min</strong><span>per prenotare</span></p>
          </div>
        </div>

        <div className="clinic-visual">
          <img src="/assets/clinic-hero.jpg" alt="Reception luminosa di una clinica moderna" />
          <div className="next-appointment-card">
            <p>Prossimo appuntamento</p>
            <div>
              <span><strong>Dr.ssa Rossi · Cardiologia</strong><small>Mercoledì 14, ore 10:30</small></span>
              <span className="status-pill">Confermato</span>
            </div>
          </div>
        </div>
      </section>

      <section id="come-funziona" className="how-demo" aria-labelledby="how-title">
        <h2 id="how-title">Come funziona la demo</h2>
        <p className="how-intro">I dati del catalogo sono esempi; gli appuntamenti creati vengono salvati realmente.</p>
        <div className="how-grid">
          {features.map((feature) => (
            <article key={feature.number} className="how-step">
              <span className="how-icon"><i className={feature.icon} /></span>
              <span className="how-number">{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
        <button type="button" onClick={tryDemo} className="how-cta">Prova la demo <span aria-hidden="true">↗</span></button>
      </section>

      <footer className="home-footer">
        <p><strong>EasyCare</strong> — progetto dimostrativo full stack</p>
        <p>Medici, prezzi, recensioni e disponibilità sono dati di esempio.</p>
      </footer>
    </main>
  );
}

export default HomePage;
