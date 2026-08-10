import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { formatDate, isSameCalendarDay } from "../utils/date";

const statusLabels = {
  scheduled: "Programmato",
  completed: "Completato",
  cancelled: "Annullato",
};

function Dashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadAppointments = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/appointments", { auth: true });
      setAppointments(data);
      setLastUpdate(new Date());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments(true);
  }, [loadAppointments]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sorted = [...appointments].sort((first, second) => new Date(first.date) - new Date(second.date));
    const future = sorted.filter((appointment) => new Date(appointment.date) >= today && appointment.status !== "cancelled");
    const past = sorted.filter((appointment) => new Date(appointment.date) < today);

    return {
      total: appointments.length,
      future,
      today: appointments.filter((appointment) => isSameCalendarDay(new Date(appointment.date), today)).length,
      tomorrow: future.find((appointment) => isSameCalendarDay(new Date(appointment.date), tomorrow)),
      last: past.at(-1),
    };
  }, [appointments]);

  const refresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="spinner mb-4 h-10 w-10" />
        <p className="text-gray-600 dark:text-gray-400">Caricamento dashboard...</p>
      </div>
    );
  }

  return (
    <main className="space-y-6 pb-20">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-white">
            <i className="fas fa-tachometer-alt text-primary-500" />Dashboard
          </h1>
          {lastUpdate && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Aggiornata alle {lastUpdate.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={refresh} disabled={refreshing} className="btn btn-outline-primary" aria-label="Aggiorna">
            <i className={`fas fa-sync-alt ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <Link to="/appointment/new" className="btn btn-primary"><i className="fas fa-plus" />Nuovo appuntamento</Link>
        </div>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      {stats.tomorrow && (
        <section className="alert alert-warning flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p>
            <i className="fas fa-bell mr-2" />Domani alle {stats.tomorrow.time}: <strong>{stats.tomorrow.title}</strong>
          </p>
          <button type="button" onClick={() => navigate(`/appointment/edit/${stats.tomorrow._id}`)} className="btn btn-outline-primary btn-sm">
            Modifica
          </button>
        </section>
      )}

      <section className="grid grid-cols-3 gap-4">
        {[
          ["Totali", stats.total, "text-primary-500"],
          ["Futuri", stats.future.length, "text-success-500"],
          ["Oggi", stats.today, "text-blue-500"],
        ].map(([label, value, color]) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Prossimi appuntamenti</h2>
          </div>
          <div className="card-body">
            {stats.future.length === 0 ? (
              <div className="py-10 text-center">
                <i className="fas fa-calendar-plus mb-4 text-5xl text-gray-300" />
                <p className="mb-4 text-gray-500 dark:text-gray-400">Non hai appuntamenti futuri.</p>
                <Link to="/appointment/new" className="btn btn-primary inline-flex">Aggiungi appuntamento</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.future.slice(0, 5).map((appointment) => (
                  <button
                    key={appointment._id}
                    type="button"
                    onClick={() => navigate(`/appointment/edit/${appointment._id}`)}
                    className="flex w-full items-start justify-between rounded-lg border border-gray-200 p-4 text-left hover:border-primary-400 dark:border-gray-700"
                  >
                    <span>
                      <strong className="block text-gray-900 dark:text-white">{appointment.title}</strong>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(appointment.date, { weekday: "long", day: "2-digit", month: "long" })} alle {appointment.time}
                      </span>
                    </span>
                    <span className="badge badge-primary">{statusLabels[appointment.status] || statusLabels.scheduled}</span>
                  </button>
                ))}
                {stats.future.length > 5 && <Link to="/calendar" className="btn btn-outline-primary mt-4">Vedi tutti</Link>}
              </div>
            )}
          </div>
        </div>

        <aside className="card">
          <div className="card-header"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Riepilogo</h2></div>
          <div className="card-body space-y-5">
            {stats.future[0] && (
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Prossimo</p>
                <p className="font-semibold text-gray-900 dark:text-white">{stats.future[0].title}</p>
                <p className="text-sm text-gray-500">{formatDate(stats.future[0].date)} alle {stats.future[0].time}</p>
              </div>
            )}
            {stats.last && (
              <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Ultimo</p>
                <p className="font-semibold text-gray-900 dark:text-white">{stats.last.title}</p>
                <p className="text-sm text-gray-500">{formatDate(stats.last.date)}</p>
              </div>
            )}
          </div>
        </aside>
      </section>

      <nav className="dashboard-footer" aria-label="Navigazione rapida">
        <Link to="/" title="Home"><i className="fas fa-home" /></Link>
        <Link to="/calendar" title="Calendario"><i className="fas fa-calendar-alt" /></Link>
        <button type="button" onClick={refresh} title="Aggiorna"><i className={`fas fa-sync-alt ${refreshing ? "animate-spin" : ""}`} /></button>
        <Link to="/profile" title="Profilo"><i className="fas fa-user" /></Link>
      </nav>
    </main>
  );
}

export default Dashboard;
