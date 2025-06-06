import React, { useState } from "react";
import { Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "./GoogleLoginButton";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
      // Salva il token (o gestisci login come preferisci)
      localStorage.setItem("token", data.token);
      navigate("/dashboard"); 
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <Col md={8} lg={5}>
        <Card className="shadow">
          <Card.Body className="p-4">
            <h3 className="mb-4 text-center">
              <i className="fas fa-sign-in-alt me-2"></i>Login
            </h3>
            {error && <Alert variant="danger">{error}</Alert>}

            <GoogleLoginButton />

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-100"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Login
                  </>
                )}
              </Button>
            </Form>
            <div className="mt-3 text-center">
              <small>
                Don't have an account?{" "}
                <span
                  role="button"
                  style={{ color: "#007bff", cursor: "pointer" }}
                  onClick={() => navigate("/register")}
                >
                  Register
                </span>
              </small>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default Login;
