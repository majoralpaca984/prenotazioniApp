import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleAuthButton from "./GoogleAuthButton";
import { apiRequest } from "../services/api";

function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Compila tutti i campi.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess("Registrazione completata. Ti porto alla pagina di accesso...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (requestError) {
      setError(requestError.message || "Registrazione non riuscita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <aside className="auth-visual auth-visual-register" aria-hidden="true">
        <span className="brand-mark"><i className="fas fa-stethoscope" /></span>
        <p className="home-eyebrow">Inizia da qui</p>
        <h1>Prenota in pochi minuti,<br /><em>senza telefonate.</em></h1>
        <p>Crea il tuo account e prova il flusso completo di EasyCare.</p>
      </aside>

      <section className="auth-panel" aria-labelledby="register-title">
        <p className="home-eyebrow">Nuovo account</p>
        <h1 id="register-title">Registrati su EasyCare</h1>
        <p className="auth-subtitle">Puoi utilizzare Google oppure creare un account con email e password.</p>

        {error && <div className="alert alert-danger"><i className="fas fa-triangle-exclamation" />{error}</div>}
        {success && <div className="alert alert-success"><i className="fas fa-circle-check" />{success}</div>}

        <GoogleAuthButton mode="register" />
        <div className="auth-divider"><span>oppure registrati con email</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-label">Nome completo
            <input type="text" name="name" placeholder="Il tuo nome" value={formData.name} onChange={handleChange} required className="form-control" />
          </label>
          <label className="form-label">Email
            <input type="email" name="email" placeholder="nome@email.it" value={formData.email} onChange={handleChange} required className="form-control" />
          </label>
          <label className="form-label">Password
            <input type="password" name="password" placeholder="Almeno 8 caratteri" value={formData.password} onChange={handleChange} minLength={8} required className="form-control" />
          </label>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? <><span className="spinner h-4 w-4" />Registrazione...</> : <>Crea account<i className="fas fa-arrow-right" /></>}
          </button>
        </form>

        <p className="auth-switch">Hai già un account? <Link to="/login">Accedi</Link></p>
      </section>
    </main>
  );
}

export default Register;
