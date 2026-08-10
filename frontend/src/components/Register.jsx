import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleAuthButton from "./GoogleAuthButton";
import { apiRequest } from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password) {
      setError("Compila tutti i campi.");
      setLoading(false);
      return;
    }

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess("Registrazione completata. Reindirizzamento al login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="card-body">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
              <i className="fas fa-user-plus mr-2"></i>Registrati
            </h3>
            
            {error && (
              <div className="alert alert-danger mb-4">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success mb-4">
                <i className="fas fa-check-circle mr-2"></i>
                {success}
              </div>
            )}

            <div className="mb-4">
              <GoogleAuthButton mode="register" />
            </div>

            <div className="text-center mb-4">
              <small className="text-gray-500 dark:text-gray-400">oppure registrati con email</small>
              <hr className="my-2 border-gray-200 dark:border-gray-600" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Inserisci il tuo nome"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Inserisci la tua email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Crea una password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Registrazione...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus mr-2"></i>
                    Registrati
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <small className="text-gray-600 dark:text-gray-400">
                Hai già un account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Accedi
                </button>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
