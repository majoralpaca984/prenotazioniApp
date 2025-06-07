import { Card, Button, Col } from "react-bootstrap";

const DoctorCard = ({ doctor }) => {
  return (
    <Col md={6} lg={4}>
      <Card className="shadow">
        <Card.Img variant="top" src={doctor.image || "/default-doctor.jpg"} />
        <Card.Body>
          <Card.Title>{doctor.name}</Card.Title>
          <Card.Text>
            <strong>Specialità:</strong> {doctor.speciality}
            <div className="mt-3">
              <strong>Disponibilità:</strong>
              <div className="d-flex justify-content-between flex-wrap mt-2 px-1">
                {["sabato", "domenica", "lunedì", "martedì", "mercoledì"].map((giorno, index) => {
                  const data = doctor.availability?.[index];
                  return (
                    <div
                      key={giorno}
                      className="text-center"
                      style={{ minWidth: "60px", flex: "1" }}
                    >
                      <div className="text-muted small">{giorno}</div>
                      <div style={{ fontSize: "0.9em" }}>
                        {data || "-"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card.Text>

          <Button
            variant="success"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Prenota ora
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default DoctorCard;
