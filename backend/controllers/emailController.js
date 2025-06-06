import dotenv from 'dotenv';
dotenv.config(); 

import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


export const sendConfirmationEmail = async (toEmail, appointment) => {
  const { date, time, doctor } = appointment;

  const msg = {
    to: toEmail,
    from: process.env.SENDER_EMAIL,
    subject: 'Conferma Appuntamento - EasyCare',
    html: `
      <h2>Ciao!</h2>
      <p>Hai prenotato un appuntamento con successo.</p>
      <p><strong>Dettagli:</strong></p>
      <ul>
        <li><strong>Data:</strong> ${date}</li>
        <li><strong>Ora:</strong> ${time}</li>
        <li><strong>Medico:</strong> ${doctor}</li>
      </ul>
      <p>Grazie per aver scelto EasyCare!</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email inviata con successo (da controller)');
  } catch (error) {
    console.error('❌ Errore durante l\'invio dell\'email:', error.response?.body || error.message);
  }
};
