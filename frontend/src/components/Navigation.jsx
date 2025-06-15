import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function Navigation() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLogged = !!localStorage.getItem("token");

  // 🧠 Estrai nome dal token
  const getUserName = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.name || "Utente";
    } catch {
      return "Utente";
    }
  };

  const userName = getUserName();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="my-navbar sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* LOGO + BRAND */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-calendar-check text-white"></i>
            </div>
            <span className="text-2xl font-bold text-primary-500">EasyCare</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {isLogged && (
              <div className="flex items-center space-x-6">
                <Link
                  to="/dashboard"
                  className="text-primary-500 hover:text-primary-600 font-medium transition-colors flex items-center space-x-2"
                >
                  <i className="fas fa-tachometer-alt"></i>
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/calendar"
                  className="text-primary-500 hover:text-primary-600 font-medium transition-colors flex items-center space-x-2"
                >
                  <i className="fas fa-calendar"></i>
                  <span>Calendario</span>
                </Link>
                {/* ✅ AGGIUNTO LINK PROFILO - DESKTOP */}
                <Link
                  to="/profile"
                  className="text-primary-500 hover:text-primary-600 font-medium transition-colors flex items-center space-x-2"
                >
                  <i className="fas fa-user"></i>
                  <span>Il Mio Profilo</span>
                </Link>
              </div>
            )}

            <div className="flex items-center space-x-4">
              {isLogged && (
                <span className="text-primary-500 font-semibold">
                  👋 Ciao, {userName}
                </span>
              )}

              {!isLogged ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors flex items-center space-x-1"
                  >
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                  >
                    <i className="fas fa-user-plus"></i>
                    <span>Register</span>
                  </Link>
                </div>
              ) : (
                <button onClick={handleLogout} className="btn btn-primary">
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="text-gray-600 dark:text-gray-300 hover:text-primary-500 focus:outline-none"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="flex flex-col space-y-4">
              {isLogged && (
                <>
                  <span className="text-primary-500 font-semibold px-4">
                    👋 Ciao, {userName}
                  </span>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors flex items-center space-x-2 px-4 py-2"
                  >
                    <i className="fas fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/calendar"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors flex items-center space-x-2 px-4 py-2"
                  >
                    <i className="fas fa-calendar"></i>
                    <span>Calendario</span>
                  </Link>
                  {/* ✅ AGGIUNTO LINK PROFILO - MOBILE */}
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors flex items-center space-x-2 px-4 py-2"
                  >
                    <i className="fas fa-user"></i>
                    <span>Il Mio Profilo</span>
                  </Link>
                </>
              )}

              {!isLogged ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors flex items-center space-x-2 px-4 py-2"
                  >
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors flex items-center space-x-2 px-4 py-2"
                  >
                    <i className="fas fa-user-plus"></i>
                    <span>Register</span>
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors flex items-center space-x-2 px-4 py-2 text-left"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;