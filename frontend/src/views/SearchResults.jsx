import { Link, useSearchParams } from "react-router-dom";
import DoctorCard from "./DoctorCard";
import { getDemoDoctors } from "../data/demoCatalog";
import { formatDate } from "../utils/date";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const service = searchParams.get("service")?.trim() || "";
  const speciality = searchParams.get("speciality")?.trim() || "";
  const city = searchParams.get("city")?.trim() || "";
  const date = searchParams.get("date") || "";
  const doctors = getDemoDoctors({ service, speciality, city, date });

  const searchLabel = service
    ? `Prestazione: ${service}`
    : speciality
      ? `Medico o specializzazione: ${speciality}`
      : "Tutti i medici dimostrativi";

  return (
    <main className="page-shell search-results-page">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="back-link">
          <i className="fas fa-arrow-left mr-2" />Torna alla ricerca
        </Link>

        <header className="results-header">
          <span className="eyebrow-label">Dati dimostrativi</span>
          <h1>Medici e disponibilità</h1>
          <div className="results-filters">
            <span>{searchLabel}</span>
            {city && <span>Zona: {city}</span>}
            {date && (
              <span>
                Dal {formatDate(`${date}T12:00:00`, { day: "2-digit", month: "long", year: "numeric" })}
              </span>
            )}
          </div>
          <p className="results-note">
            I profili, le recensioni, i prezzi e gli orari sono esempi. La prenotazione creata viene invece salvata davvero nel tuo account.
          </p>
        </header>

        {doctors.length > 0 ? (
          <div className="doctor-results-list">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} requestedService={service} />
            ))}
          </div>
        ) : (
          <section className="card p-10 text-center">
            <i className="fas fa-search mb-4 text-5xl text-gray-300" />
            <h2 className="text-xl font-bold">Nessun medico trovato</h2>
            <p className="mt-2 text-gray-500">Prova una delle prestazioni suggerite nella pagina iniziale.</p>
            <Link to="/" className="btn btn-primary mt-6 inline-flex">Modifica ricerca</Link>
          </section>
        )}
      </div>
    </main>
  );
}

export default SearchResults;
