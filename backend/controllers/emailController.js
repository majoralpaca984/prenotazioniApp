import "dotenv/config";
import sgMail from "@sendgrid/mail";

const senderEmail = process.env.SENDER_EMAIL;
const frontendUrl = process.env.FRONTEND_URL || "https://prenotazioni-online.vercel.app";
const emailEnabled = Boolean(process.env.SENDGRID_API_KEY && senderEmail);

if (emailEnabled) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export async function sendConfirmationEmail(toEmail, appointment) {
  if (!emailEnabled || !toEmail) return false;

  const formattedDate = new Date(appointment.date).toLocaleDateString("it-IT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const title = escapeHtml(appointment.doctor);
  const editUrl = `${frontendUrl}/login?redirect=/appointment/edit/${appointment._id}`;

  await sgMail.send({
    to: toEmail,
    from: senderEmail,
    subject: "Conferma appuntamento - EasyCare",
    text: [
      "Il tuo appuntamento è stato registrato.",
      `Servizio: ${appointment.doctor}`,
      `Data: ${formattedDate}`,
      `Ora: ${appointment.time}`,
      `Modifica: ${editUrl}`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#1f2937">
        <h1 style="color:#2563eb">Appuntamento registrato</h1>
        <p>La prenotazione è stata salvata correttamente.</p>
        <div style="background:#eff6ff;border-radius:10px;padding:18px;margin:20px 0">
          <p><strong>Servizio:</strong> ${title}</p>
          <p><strong>Data:</strong> ${escapeHtml(formattedDate)}</p>
          <p><strong>Ora:</strong> ${escapeHtml(appointment.time)}</p>
        </div>
        <a href="${editUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 18px;border-radius:8px;text-decoration:none">
          Gestisci appuntamento
        </a>
        <p style="margin-top:24px;font-size:12px;color:#6b7280">Email automatica del progetto dimostrativo EasyCare.</p>
      </div>
    `,
  });

  return true;
}
