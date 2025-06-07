import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import LinkContainer from "./LinkContainer";
import logo from "../assets/logoEasyCare.png";
import ThemeToggle from "./ThemeToggle";

function Navigation() {
  const navigate = useNavigate();
  const isLogged = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Pulsante tema in alto a destra */}
      <div className="position-absolute top-0 end-0 p-3 z-3">
        <ThemeToggle />
      </div>

      <Navbar expand="md" className="my-navbar sticky-top shadow-sm px-3">
        <Container fluid className="d-flex justify-content-between align-items-center">
          {/* LOGO + BRAND */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
            <img
              src={logo}
              alt="EasyCare Logo"
              height="40"
              width="40"
              style={{ borderRadius: "8px", objectFit: "contain" }}
            />
            <span className="fw-bold fs-4 text-primary">EasyCare</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar-nav" />
          <Navbar.Collapse id="main-navbar-nav">
            <Nav className="me-auto d-flex gap-3">
              {isLogged && (
                <>
                  <Nav.Link as={LinkContainer} to="/dashboard" className="text-primary fw-medium">
                    <i className="fas fa-tachometer-alt me-1"></i> Dashboard
                  </Nav.Link>
                  <Nav.Link as={LinkContainer} to="/calendar" className="text-primary fw-medium">
                    <i className="fas fa-calendar me-1"></i> Calendario
                  </Nav.Link>
                </>
              )}
            </Nav>

            <Nav className="d-flex align-items-center gap-3">
              {!isLogged ? (
                <>
                  <Nav.Link as={LinkContainer} to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i> Login
                  </Nav.Link>
                  <Nav.Link as={LinkContainer} to="/register">
                    <i className="fas fa-user-plus me-1"></i> Register
                  </Nav.Link>
                </>
              ) : (
                <Button variant="primary" size="sm" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i> Logout
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Navigation;