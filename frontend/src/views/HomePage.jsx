import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import TextCarousel from "../components/TextCarousel";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../style/theme.css";

const HomePage = () => {
  const [prestazione, setPrestazione] = useState("");
  const [data, setData] = useState("");
  const navigate = useNavigate();

  const handlePrestazioneSubmit = (e) => {
    e.preventDefault();
    if (prestazione.trim()) {
      navigate(`/search?speciality=${encodeURIComponent(prestazione.trim())}`);
    }
  };

  return (
    <div className="homepage">
      {/* Hero con immagine di sfondo full width */}
      <div className="hero-section text-white text-center">
        <div className="hero-overlay container">
          <div className="hero-text-box mb-4">
            <h1 className="main-title display-5 fw-bold mb-2">
              Prenota Esami e Visite Online
            </h1>
            <p className="lead mb-0">
              Prenota le tue visite mediche e gli esami diagnostici in modo semplice e veloce, senza code o attese.
            </p>
          </div>

          <div
            className="search-bar p-3 rounded-4 shadow-sm bg-light bg-opacity-75 mx-auto"
            style={{ maxWidth: "900px" }}
          >
            <form className="row g-2 align-items-center" onSubmit={handlePrestazioneSubmit}>
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cerca prestazione..."
                  value={prestazione}
                  onChange={(e) => setPrestazione(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="date"
                  className="form-control"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
              <div className="col-md-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary w-100">
                  Cerca Prestazione
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Container>
        {/* Carousel + motivazioni */}
        <div className="text-center mt-5">
          <TextCarousel />
          <div className="section-box text-center">
            <ul className="list-unstyled">
              <h3 className="subtitle mb-4">Perché scegliere il nostro servizio?</h3>
              <li>🔹 Prenotazioni rapide 24/7</li>
              <li>🔹 Nessuna attesa al telefono</li>
              <li>🔹 Prezzi trasparenti e accessibili</li>
              <li>🔹 Recensioni verificate degli utenti</li>
            </ul>
          </div>
        </div>

        {/* Servizi */}
        <section className="section-box bg-light-green text-center py-5">
  <div className="container">
    <h2 className="mb-4 text-primary">Servizio Medico</h2>
    <div className="row justify-content-center">
      <div className="col-md-5 mb-4">
        <div className="service-card p-4">
          <h4 className="text-primary">
            Pronto <strong>Dottore</strong> <span className="text-muted">h24</span>
          </h4>
          <p className="mb-3">Hai bisogno urgente di parlare con un medico?</p>
          <ul className="text-start list-unstyled">
            <li>✅ Consulto entro 30 minuti</li>
            <li>✅ Disponibile 12/7</li>
            <li>✅ Anche nei festivi</li>
          </ul>
          <button className="btn btn-primary mt-2" onClick={() => navigate("/DoctorCard")}>
            Come funziona
          </button>
        </div> 

      <div className="col-md-5 mb-4">
        <div className="service-card p-4">
          <h4 className="text-primary">
            Pronto <strong>Pediatra</strong> <span className="text-muted">h24</span>
          </h4>
          <p className="mb-3">Hai bisogno del consiglio di un pediatra?</p>
          <ul className="text-start list-unstyled">
            <li>✅ Consulto entro 30 minuti</li>
            <li>✅ Disponibile 12/7</li>
            <li>✅ Anche nei festivi</li>
          </ul>
          <button className="btn btn-primary mt-2" onClick={() => navigate("/DoctorCard")}>
            Come funziona
          </button>
        </div>
      </div>
    </div>
  </div>
</section>


        {/* Footer */}
        <div className="footer mt-5 py-4">
          <Container>
            <Row>
              <Col md={3}>
                <p className="small footer-text mb-2">
                  © 2025 PrenotaFacile
                  <br /> P.IVA 01234567890
                  <br /> info@easycare.it
                </p>
              </Col>
              <Col md={3}>
                <h6 className="footer-text fw-bold">Visite richieste</h6>
                <ul className="footer-links">
                  <li>Visita Ginecologica</li>
                  <li>Visita Cardiologica</li>
                  <li>Visita Dermatologica</li>
                </ul>
              </Col>
              <Col md={3}>
                <h6 className="footer-text fw-bold">Esami richiesti</h6>
                <ul className="footer-links">
                  <li>Ecografia Addome</li>
                  <li>RMN Ginocchio</li>
                  <li>Tc Torace</li>
                </ul>
              </Col>
              <Col md={3}>
                <h6 className="footer-text fw-bold">Link Utili</h6>
                <ul className="footer-links">
                  <li>Privacy Policy</li>
                  <li>Cookie Policy</li>
                  <li>Termini e Condizioni</li>
                </ul>
              </Col>
            </Row>
          </Container>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;
