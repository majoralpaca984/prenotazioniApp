import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const ExamsPage = () => {
  return (
    <Container className="py-5">
      <h1 className="text-center text-primary mb-4">Esami e Prestazioni</h1>

      {/* Sezione: Diagnostica per Immagini */}
      <section className="mb-5">
        <h3 className="text-secondary">Diagnostica per Immagini</h3>
        <ul>
          <li>Risonanza Magnetica 1.5T</li>
          <li>TAC 512 strati a basso dosaggio</li>
          <li>Ecografia ed Eco Doppler</li>
          <li>Radiologia Digitale</li>
          <li>Mammografia</li>
        </ul>
      </section>

      {/* Sezione: Medicina Nucleare */}
      <section className="mb-5">
        <h3 className="text-secondary">Medicina Nucleare</h3>
        <ul>
          <li>Scintigrafia ossea</li>
          <li>Scintigrafia renale</li>
          <li>Scintigrafia polmonare</li>
          <li>Scintigrafia tiroidea</li>
          <li>Diagnostica oncologica</li>
        </ul>
      </section>

      {/* Sezione: Analisi Cliniche */}
      <section className="mb-5">
        <h3 className="text-secondary">Analisi Cliniche</h3>
        <ul>
          <li>Esami del sangue</li>
          <li>Esami delle urine</li>
          <li>Esami citologici</li>
          <li>Test sierologici per SARS-CoV-2</li>
          <li>Tamponi antigenici rapidi</li>
        </ul>
      </section>

      {/* Sezione: Visite Specialistiche */}
      <section className="mb-5">
        <h3 className="text-secondary">Visite Specialistiche</h3>
        <ul>
          <li>Chirurgia Generale</li>
          <li>Senologia</li>
          <li>Oncologia</li>
          <li>Dietologia</li>
          <li>Psicologia</li>
        </ul>
      </section>
    </Container>
  );
};

export default ExamsPage;
