// src/views/Search/DoctorCard.jsx
import { Card, Button, Col } from "react-bootstrap";

const DoctorCard = ({ doctor }) => {
  return (
    <Col md={4}>
      <Card className="shadow">
        <Card.Img variant="top" src={doctor.image || "/default-doctor.jpg"} />
        <Card.Body>
          <Card.Title>{doctor.name}</Card.Title>
          <Card.Text>
            <strong>Specialità:</strong> {doctor.speciality} <br />
            <strong>Disponibilità:</strong> {doctor.availability?.join(", ") || "Nessuna"}
          </Card.Text>
          <Button variant="success" href={`/booking/${doctor._id}`}>
            Prenota ora
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default DoctorCard;
