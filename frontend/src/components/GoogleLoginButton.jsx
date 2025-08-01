import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleLoginButton() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadGoogleScript = () => {
      if (!window.google && !document.getElementById("google-gsi-script")) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.id = "google-gsi-script";
        document.body.appendChild(script);
        script.onload = renderGoogleButton;
      } else if (window.google) {
        renderGoogleButton();
      }
    };

    const renderGoogleButton = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        ux_mode: "popup",               // ✅ Forza popup per compatibilità
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-login"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
        }
      );
    };

    loadGoogleScript();
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const res = await fetch(`${API_URL}/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) throw new Error("Login fallito");

      const data = await res.json();
      localStorage.setItem("token", data.token);

      const redirectPath = searchParams.get("redirect");
      navigate(redirectPath || "/dashboard");
    } catch (err) {
      console.error("Errore login Google:", err);
    }
  };

  return <div id="google-login" className="mb-4 text-center" />;
}

export default GoogleLoginButton;
