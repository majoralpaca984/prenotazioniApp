import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleRegisterButton() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,               
        cancel_on_tap_outside: true,     
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-register"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signup_with", 
        }
      );
    }
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const res = await fetch(`${API_URL}/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) throw new Error("Registrazione fallita");

      const data = await res.json();
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Errore registrazione Google:", err);
    }
  };

  return (
    <div id="google-register" className="mb-4 text-center" />
  );
}

export default GoogleRegisterButton;