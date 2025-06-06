import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function GoogleLoginButton() {
  // Funzione di callback per il token Google
  const handleGoogleResponse = async (response) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      if (!res.ok) throw new Error("Login Google fallito");
      const data = await res.json();
      // Salva il token dove preferisci (qui localStorage)
      localStorage.setItem("token", data.token);
      window.location.href = "/"; // O redirigi dove vuoi
    } catch (error) {
      alert("Login Google fallito");
    }
  };

  useEffect(() => {
    // Attendi che la libreria Google sia caricata
    const interval = setInterval(() => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-login"),
          { theme: "outline", size: "large", width: 320 }
        );
        clearInterval(interval); 
      }
    }, 100);
    // Pulisci l'intervallo quando il componente viene smontato
    return () => clearInterval(interval);
    
  }, []);

  return (
    <div
      id="google-login"
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "1rem",
      }}
    ></div>
  );
}

export default GoogleLoginButton;
