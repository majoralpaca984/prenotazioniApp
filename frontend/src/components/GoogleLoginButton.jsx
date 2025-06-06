import React from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "1rem",
      }}
    >
      <button onClick={handleGoogleLogin} className="btn btn-outline-danger w-100">
        <i className="fab fa-google me-2"></i> Accedi con Google
      </button>
    </div>
  );
}

export default GoogleLoginButton;
