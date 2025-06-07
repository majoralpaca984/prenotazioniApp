import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Spinner } from "react-bootstrap";
import DoctorCard from "./DoctorCard";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const query = useQuery();
  const speciality = query.get("speciality");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchDoctors = async () => {
    try {
      console.log("🔍 Tentativo fetch con specialità:", speciality);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/doctors?speciality=${speciality}`);
      console.log("📥 Risposta fetch:", res);

      if (!res.ok) throw new Error(`Errore nella fetch: ${res.status}`);

      const data = await res.json();
      console.log("✅ Dati ricevuti:", data);
      setDoctors(data);
    } catch (err) {
      console.error("❌ Errore nella fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  if (speciality) fetchDoctors();
}, [speciality]);

  return (
    <Container>
      <h2 className="mt-4">Risultati per: {speciality}</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Row className="g-4 mt-3">
          {doctors.length > 0 ? (
            doctors.map((doc) => <DoctorCard key={doc._id} doctor={doc} />)
          ) : (
            <p>Nessun medico trovato.</p>
          )}
        </Row>
      )}
    </Container>
  );
};

export default SearchResults;
