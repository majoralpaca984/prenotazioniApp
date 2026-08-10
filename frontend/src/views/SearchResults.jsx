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
    <main className="min-h-screen bg-gray-50 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4">
        <Link to="/" className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-700">
          <i className="fas fa-arrow-left mr-2" />Torna alla ricerca
        </Link>

        <header className="mb-8">
          <span className="badge badge-primary mb-3 inline-flex">Dati dimostrativi</span>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Medici e disponibilità</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-gray-800">{searchLabel}</span>
            {city && <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-gray-800">Zona: {city}</span>}
            {date && (
              <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-gray-800">
                Dal {formatDate(`${date}T12:00:00`, { day: "2-digit", month: "long", year: "numeric" })}
              </span>
            )}
          </div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            I profili, le recensioni, i prezzi e gli orari sono esempi. La prenotazione creata viene invece salvata davvero nel tuo account.
          </p>
        </header>

        {doctors.length > 0 ? (
          <div className="space-y-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} requestedService={service} />
            ))}
          </div>
        ) : (
          <section className="card p-10 text-center">
            <i className="fas fa-search mb-4 text-5xl text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nessun medico trovato</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Prova una delle prestazioni suggerite nella pagina iniziale.</p>
            <Link to="/" className="btn btn-primary mt-6 inline-flex">Modifica ricerca</Link>
          </section>
        )}
      </div>
    </main>
  );
}

export default SearchResults;
