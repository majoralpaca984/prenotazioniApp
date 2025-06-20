import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CalendarPage from "./views/CalendarPage";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import AppointmentForm from "./components/AppointmentForm";
import Login from "./components/Login";
import Register from "./components/Register";
import Homepage from "./views/HomePage";
import SearchResults from "./views/SearchResults";
import UserProfile from "./views/UserProfile";
import PaymentPage from "./views/PaymentPage";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Navigation />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Routes>
          {/* Homepage pubblica */}
          <Route path="/" element={<Homepage />} />
          
          {/* Rotte protette */}
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/appointment/new" element={<ProtectedRoute><AppointmentForm /></ProtectedRoute>} />
          <Route path="/appointment/edit/:id" element={<ProtectedRoute><AppointmentForm /></ProtectedRoute>} />
          
          
          {/* Rotte pubbliche */}
          <Route path="/search" element={<SearchResults />} />
          
          {/* Autenticazione */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Default: reindirizza alla homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;