import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GoogleAuthButton from "./GoogleAuthButton";
import { apiRequest } from "../services/api";
import { getSafeRedirectPath, setToken } from "../utils/auth";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); //  Per gestire i parametri URL
  const redirectPath = getSafeRedirectPath(searchParams.get("redirect"));

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setToken(data.token);
      
      //  GESTISCI REDIRECT dall'email
      navigate(redirectPath);
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="card-body">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
              <i className="fas fa-sign-in-alt mr-2"></i>Login
            </h3>
            
            {error && (
              <div className="alert alert-danger mb-4">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
              </div>
            )}

            {/*  Messaggio se viene da un link email */}
            {searchParams.get('redirect') && (
              <div className="alert bg-blue-50 border-blue-200 text-blue-800 mb-4">
                <i className="fas fa-info-circle mr-2"></i>
                Accedi per continuare alla pagina richiesta
              </div>
            )}

            <div className="mb-4">
              <GoogleAuthButton redirectTo={redirectPath} />
            </div>

            <div className="text-center mb-4">
              <small className="text-gray-500 dark:text-gray-400">oppure accedi con email</small>
              <hr className="my-2 border-gray-200 dark:border-gray-600" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Inserisci la tua email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoFocus
                  className="form-control"
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Inserisci la password"
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
                    Accesso...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Accedi
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <small className="text-gray-600 dark:text-gray-400">
                Non hai un account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Registrati
                </button>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
