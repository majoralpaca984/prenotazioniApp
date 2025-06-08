export const sendConfirmationEmail = async (toEmail, appointment) => {
  const { date, time, doctor, _id } = appointment;

  const formattedDate = new Date(date).toLocaleDateString("it-IT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const msg = {
    to: toEmail,
    from: process.env.SENDER_EMAIL,
    subject: "📅 Conferma Appuntamento - EasyCare",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <div style="background-color: #007bff; padding: 20px; text-align: center;">
            <img src="https://i.postimg.cc/cCtTbhKC/logoEasyCare.png" alt="EasyCare Logo" width="100" style="margin-bottom: 10px;" />
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Conferma Appuntamento</h1>
          </div>

          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Ciao! 🎉 La tua prenotazione è andata a buon fine. Ecco i dettagli:
            </p>

            <p style="font-size: 16px; color: #333; margin: 0 0 10px;"><strong>📅 Data:</strong> ${formattedDate}</p>
            <p style="font-size: 16px; color: #333; margin: 0 0 10px;"><strong>⏰ Ora:</strong> ${time}</p>
            <p style="font-size: 16px; color: #333; margin: 0 0 20px;"><strong>🔬 Esame:</strong> ${doctor}</p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || "https://easycare.it"}/appointment/cancel/${_id}" 
                 style="background-color: #dc3545; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                ❌ Disdici Appuntamento
              </a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">Grazie per aver scelto <strong>EasyCare</strong> 💙</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email inviata con successo (corpo completo)");
  } catch (error) {
    console.error("❌ Errore durante l'invio dell'email:", error.response?.body || error.message);
  }
};
