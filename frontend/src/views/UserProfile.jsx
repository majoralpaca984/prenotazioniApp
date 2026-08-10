import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { setToken } from "../utils/auth";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  birthDate: "",
  address: "",
  avatar: "",
};

const emptyPasswords = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(emptyProfile);
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const user = await apiRequest("/auth/profile", { auth: true });
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        birthDate: user.birthDate?.split("T")[0] || "",
        address: user.address || "",
        avatar: user.avatar || "",
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const result = await apiRequest("/auth/profile", {
        auth: true,
        method: "PUT",
        body: JSON.stringify(profile),
      });
      if (result.token) setToken(result.token);
      setMessage("Profilo aggiornato con successo.");
      setEditing(false);
      await loadProfile();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Le nuove password non coincidono.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError("La nuova password deve contenere almeno 8 caratteri.");
      return;
    }

    setSaving(true);
    try {
      await apiRequest("/auth/change-password", {
        auth: true,
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      setPasswords(emptyPasswords);
      setMessage("Password aggiornata con successo.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner h-10 w-10" />
      </div>
    );
  }

  const fields = [
    { name: "name", label: "Nome completo", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Telefono", type: "tel" },
    { name: "birthDate", label: "Data di nascita", type: "date" },
    { name: "address", label: "Indirizzo", type: "text", wide: true },
    { name: "avatar", label: "URL immagine profilo", type: "url", wide: true },
  ];

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header className="profile-header rounded-2xl p-6 text-white md:p-8">
        <button type="button" onClick={() => navigate("/dashboard")} className="mb-5 text-white/80 hover:text-white">
          <i className="fas fa-arrow-left mr-2" />Dashboard
        </button>
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/20 text-4xl shadow-lg">
            {profile.avatar ? <img src={profile.avatar} alt="Profilo" className="h-full w-full object-cover" /> : <i className="fas fa-user" />}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile.name || "Il mio profilo"}</h1>
            <p className="mt-1 text-white/80">{profile.email}</p>
          </div>
        </div>
      </header>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <section className="card">
        <div className="card-header flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Dati personali</h2>
            <p className="text-sm text-gray-500">Aggiorna le informazioni del tuo account.</p>
          </div>
          <button type="button" onClick={() => setEditing((value) => !value)} className="btn btn-outline-primary">
            <i className={`fas ${editing ? "fa-times" : "fa-edit"}`} />{editing ? "Annulla" : "Modifica"}
          </button>
        </div>

        <form onSubmit={saveProfile} className="card-body grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={field.wide ? "md:col-span-2" : ""}>
              <label className="form-label" htmlFor={`profile-${field.name}`}>{field.label}</label>
              {editing ? (
                <input
                  id={`profile-${field.name}`}
                  type={field.type}
                  value={profile[field.name]}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  required={field.required}
                  className="form-control"
                />
              ) : (
                <p className="rounded-lg bg-gray-50 p-3 text-gray-900">
                  {profile[field.name] || "Non specificato"}
                </p>
              )}
            </div>
          ))}

          {editing && (
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="btn btn-primary">
                <i className="fas fa-save" />{saving ? "Salvataggio..." : "Salva modifiche"}
              </button>
            </div>
          )}
        </form>
      </section>

      <section className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">Sicurezza</h2>
          <p className="text-sm text-gray-500">Scegli una password di almeno 8 caratteri.</p>
        </div>
        <form onSubmit={changePassword} className="card-body grid gap-5 md:grid-cols-3">
          {[
            ["currentPassword", "Password attuale"],
            ["newPassword", "Nuova password"],
            ["confirmPassword", "Conferma password"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="form-label" htmlFor={name}>{label}</label>
              <input
                id={name}
                type="password"
                value={passwords[name]}
                onChange={(event) => setPasswords((current) => ({ ...current, [name]: event.target.value }))}
                required={name !== "currentPassword"}
                className="form-control"
              />
            </div>
          ))}
          <div className="md:col-span-3">
            <button type="submit" disabled={saving} className="btn btn-primary">
              <i className="fas fa-key" />Aggiorna password
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default UserProfile;
