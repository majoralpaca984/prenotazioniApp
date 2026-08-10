import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import GoogleAuthButton from "./GoogleAuthButton";
import { apiRequest } from "../services/api";
import { getSafeRedirectPath, setToken } from "../utils/auth";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = getSafeRedirectPath(searchParams.get("redirect"));

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setToken(data.token);
      navigate(redirectPath);
    } catch (requestError) {
      setError(requestError.message || "Accesso non riuscito");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <aside className="auth-visual" aria-hidden="true">
        <span className="brand-mark"><i className="fas fa-stethoscope" /></span>
        <p className="home-eyebrow">Area personale</p>
        <h1>La tua salute,<br /><em>organizzata meglio.</em></h1>
        <p>Tutti gli appuntamenti in un unico posto, sempre disponibili.</p>
      </aside>

      <section className="auth-panel" aria-labelledby="login-title">
        <p className="home-eyebrow">Bentornata</p>
        <h1 id="login-title">Accedi al tuo account</h1>
        <p className="auth-subtitle">Gestisci visite, esami e appuntamenti dalla tua dashboard.</p>

        {error && <div className="alert alert-danger"><i className="fas fa-triangle-exclamation" />{error}</div>}
        {searchParams.get("redirect") && <div className="alert alert-info">Accedi per continuare alla pagina richiesta.</div>}

        <GoogleAuthButton redirectTo={redirectPath} />
        <div className="auth-divider"><span>oppure accedi con email</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="form-label">Email
            <input type="email" name="email" placeholder="nome@email.it" value={formData.email} onChange={handleChange} required autoFocus className="form-control" />
          </label>
          <label className="form-label">Password
            <input type="password" name="password" placeholder="Inserisci la password" value={formData.password} onChange={handleChange} required className="form-control" />
          </label>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? <><span className="spinner h-4 w-4" />Accesso...</> : <>Accedi<i className="fas fa-arrow-right" /></>}
          </button>
        </form>

        <p className="auth-switch">Non hai un account? <Link to="/register">Registrati</Link></p>
      </section>
    </main>
  );
}

export default Login;
