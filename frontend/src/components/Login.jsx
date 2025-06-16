import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GoogleLoginButton from "./GoogleLoginButton";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // ✅ Per gestire i parametri URL

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }
      const data = await response.json();
      localStorage.setItem("token", data.token);
      
      // ✅ GESTISCI REDIRECT dall'email
      const redirectPath = searchParams.get('redirect');
      navigate(redirectPath || "/dashboard");
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

            {/* ✅ Messaggio se viene da un link email */}
            {searchParams.get('redirect') && (
              <div className="alert bg-blue-50 border-blue-200 text-blue-800 mb-4">
                <i className="fas fa-info-circle mr-2"></i>
                Accedi per continuare alla pagina richiesta
              </div>
            )}

            <div className="mb-4">
              <GoogleLoginButton />
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
                  placeholder="Enter your email"
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
                  placeholder="Enter your password"
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
                    Logging in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Login
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <small className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Register
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