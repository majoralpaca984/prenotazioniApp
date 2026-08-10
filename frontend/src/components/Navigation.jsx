import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearToken, getTokenPayload, isAuthenticated } from "../utils/auth";

const publicLinks = [
  { to: "/#prenota", label: "Prenota" },
  { to: "/#come-funziona", label: "Come funziona" },
];

const privateLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "fa-chart-simple" },
  { to: "/calendar", label: "Calendario", icon: "fa-calendar-days" },
  { to: "/profile", label: "Profilo", icon: "fa-user" },
];

function Navigation() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLogged = isAuthenticated();
  const userName = getTokenPayload()?.name || "Utente";

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    clearToken();
    closeMenu();
    navigate("/login");
  };

  return (
    <header className="my-navbar sticky top-0 z-40">
      <div className="nav-shell">
        <Link to="/" onClick={closeMenu} className="brand-link" aria-label="EasyCare, torna alla homepage">
          <span className="brand-mark"><i className="fas fa-stethoscope" /></span>
          <span>EasyCare</span>
        </Link>

        <nav className="desktop-nav" aria-label="Navigazione principale">
          {!isLogged && publicLinks.map((link) => (
            <a key={link.to} href={link.to} className="nav-link">{link.label}</a>
          ))}

          {isLogged && privateLinks.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link">
              <i className={`fas ${link.icon}`} />{link.label}
            </Link>
          ))}
        </nav>

        <div className="desktop-actions">
          {isLogged ? (
            <>
              <span className="welcome-copy">Ciao, {userName}</span>
              <button type="button" onClick={handleLogout} className="btn btn-outline-primary">Esci</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link"><i className="fas fa-arrow-right-to-bracket" />Accedi</Link>
              <Link to="/register" className="btn btn-primary">Registrati</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen((value) => !value)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
        >
          <i className={`fas ${isMenuOpen ? "fa-xmark" : "fa-bars"}`} />
        </button>
      </div>

      {isMenuOpen && (
        <nav className="mobile-nav" aria-label="Navigazione mobile">
          {(isLogged ? privateLinks : []).map((link) => (
            <Link key={link.to} to={link.to} onClick={closeMenu} className="mobile-nav-link">
              <i className={`fas ${link.icon}`} />{link.label}
            </Link>
          ))}
          {!isLogged && publicLinks.map((link) => (
            <a key={link.to} href={link.to} onClick={closeMenu} className="mobile-nav-link">{link.label}</a>
          ))}
          {isLogged ? (
            <button type="button" onClick={handleLogout} className="mobile-nav-link"><i className="fas fa-arrow-right-from-bracket" />Esci</button>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="mobile-nav-link">Accedi</Link>
              <Link to="/register" onClick={closeMenu} className="btn btn-primary">Registrati</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

export default Navigation;
