import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { setToken } from "../utils/auth";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_ID = "google-gsi-script";

function loadGoogleScript() {
  if (window.google) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function GoogleAuthButton({ mode = "login", redirectTo = "/dashboard" }) {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;

    let isMounted = true;

    const initialize = async () => {
      try {
        await loadGoogleScript();
        if (!isMounted || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async ({ credential }) => {
            try {
              const data = await apiRequest("/auth/google-login", {
                method: "POST",
                body: JSON.stringify({ credential }),
              });
              setToken(data.token);
              navigate(redirectTo);
            } catch (requestError) {
              setError(requestError.message);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: buttonRef.current.offsetWidth,
          text: mode === "register" ? "signup_with" : "signin_with",
        });
      } catch {
        if (isMounted) setError("Accesso con Google non disponibile.");
      }
    };

    initialize();
    return () => {
      isMounted = false;
    };
  }, [mode, navigate, redirectTo]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="mb-4 text-center">
      <div ref={buttonRef} />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default GoogleAuthButton;
