// 📧 IMPORT SENDGRID
import sgMail from '@sendgrid/mail';

// Configura SendGrid con la tua API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 🚀 QUEUE per non bloccare le API
const emailQueue = [];
let isProcessing = false;

// Processa le email in background
const processEmailQueue = async () => {
  if (isProcessing || emailQueue.length === 0) return;
  
  isProcessing = true;
  
  // Prendi fino a 5 email dalla queue
  const emails = emailQueue.splice(0, 5);
  
  try {
    // Invia tutte insieme (più veloce)
    if (emails.length === 1) {
      await sgMail.send(emails[0]);
    } else {
      await sgMail.send(emails);
    }
    
    console.log(`✅ ${emails.length} email inviate con successo`);
  } catch (error) {
    console.error("❌ Errore invio email:", error.response?.body || error.message);
    
    // Se batch fallisce, riprova con singole email
    if (emails.length > 1) {
      for (const email of emails) {
        try {
          await sgMail.send(email);
          console.log(`✅ Email singola inviata a ${email.to}`);
        } catch (singleError) {
          console.error(`❌ Fallimento email singola:`, singleError.message);
        }
      }
    }
  }
  
  isProcessing = false;
  
  // Continua a processare se ci sono altre email
  if (emailQueue.length > 0) {
    setTimeout(processEmailQueue, 1000);
  }
};

export const sendConfirmationEmail = async (toEmail, appointment) => {
  const { date, time, doctor, _id } = appointment;

  // 📅 Formattazione data migliorata
  const formattedDate = new Date(date).toLocaleDateString("it-IT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const frontendUrl = process.env.FRONTEND_URL || "https://prenotazioni-online.vercel.app";

  // 🎨 Template email migliorato
  const msg = {
    to: toEmail,
    from: process.env.SENDER_EMAIL,
    subject: "📅 Conferma Appuntamento - EasyCare",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <img src="https://i.postimg.cc/cCtTbhKC/logoEasyCare.png" alt="EasyCare Logo" width="80" style="margin-bottom: 15px; border-radius: 50%;" />
            <h1 style="color: #ffffff; font-size: 26px; margin: 0; font-weight: 600;">✅ Appuntamento Confermato!</h1>
          </div>

          <!-- Body -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 18px; color: #333; margin-bottom: 25px; line-height: 1.6;">
              Ciao! 🎉 <strong>La tua prenotazione è confermata</strong>. Ecco tutti i dettagli:
            </p>

            <!-- Dettagli appuntamento -->
            <div style="background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #667eea;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <span style="font-size: 24px; margin-right: 12px;">📅</span>
                <div>
                  <strong style="color: #333; font-size: 16px;">Data:</strong><br>
                  <span style="color: #667eea; font-size: 18px; font-weight: 600;">${formattedDate}</span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <span style="font-size: 24px; margin-right: 12px;">⏰</span>
                <div>
                  <strong style="color: #333; font-size: 16px;">Orario:</strong><br>
                  <span style="color: #667eea; font-size: 18px; font-weight: 600;">${time}</span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-size: 24px; margin-right: 12px;">🔬</span>
                <div>
                  <strong style="color: #333; font-size: 16px;">Servizio:</strong><br>
                  <span style="color: #667eea; font-size: 18px; font-weight: 600;">${doctor}</span>
                </div>
              </div>
            </div>

            <!-- Pulsanti azione - ✅ CON REDIRECT AL LOGIN -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/login?redirect=/appointment/edit/${_id}" 
                 style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 10px; display: inline-block; transition: all 0.3s;">
                ✏️ Modifica Appuntamento
              </a>
              
              <a href="${frontendUrl}/login?redirect=/calendar" 
                 style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 10px; display: inline-block;">
                📅 Vedi Calendario
              </a>
            </div>

            <!-- Promemoria -->
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>💡 Promemoria:</strong> Riceverai un messaggio di promemoria 24 ore prima dell'appuntamento. 
                Puoi modificare o cancellare l'appuntamento fino a 2 ore prima.
              </p>
            </div>

            <!-- Footer message -->
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 14px; color: #666; text-align: center; line-height: 1.5;">
              Grazie per aver scelto <strong style="color: #667eea;">EasyCare</strong> 💙<br>
              <small>Il team che si prende cura di te</small>
            </p>
          </div>
        </div>
        
        <!-- Footer disclaimer -->
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
          Questa email è stata generata automaticamente, non rispondere a questo messaggio.
        </p>
      </div>
    `,
    
    // 📱 Versione testo per client senza HTML
    text: `
APPUNTAMENTO CONFERMATO - EasyCare

Ciao! La tua prenotazione è confermata:

📅 Data: ${formattedDate}
⏰ Ora: ${time}
🔬 Servizio: ${doctor}

Puoi modificare l'appuntamento visitando:
${frontendUrl}/login?redirect=/appointment/edit/${_id}

Oppure visualizza il calendario:
${frontendUrl}/login?redirect=/calendar

Riceverai un promemoria 24 ore prima dell'appuntamento.

Grazie per aver scelto EasyCare!
    `
  };

  // 🚀 Aggiungi alla queue invece di inviare subito (non blocca l'API!)
  emailQueue.push(msg);
  processEmailQueue();
  
  console.log(`📧 Email aggiunta alla coda per: ${toEmail}`);
};

// 🔔 BONUS: Funzione per email di promemoria (puoi usarla dopo)
export const sendReminderEmail = async (toEmail, appointment) => {
  const { date, time, doctor, _id } = appointment;

  const formattedDate = new Date(date).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const frontendUrl = process.env.FRONTEND_URL || "https://prenotazioni-online.vercel.app";

  const msg = {
    to: toEmail,
    from: process.env.SENDER_EMAIL,
    subject: "🔔 Promemoria Appuntamento Domani - EasyCare",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #fff8e1; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; border-left: 6px solid #ff9800;">
          <div style="padding: 30px;">
            <h2 style="color: #f57c00; margin-top: 0;">🔔 Promemoria Appuntamento</h2>
            <p style="font-size: 16px; color: #333;">
              Ti ricordiamo che hai un appuntamento <strong>domani</strong>:
            </p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>📅 ${formattedDate}</strong></p>
              <p style="margin: 5px 0;"><strong>⏰ ${time}</strong></p>
              <p style="margin: 5px 0;"><strong>🔬 ${doctor}</strong></p>
            </div>
            <div style="text-align: center; margin-top: 25px;">
              <a href="${frontendUrl}/login?redirect=/appointment/edit/${_id}" 
                 style="background-color: #ff9800; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Modifica se necessario
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  };

  emailQueue.push(msg);
  processEmailQueue();
};

// 🧪 Funzione per testare la configurazione
export const testEmailSetup = async () => {
  try {
    const testMsg = {
      to: process.env.SENDER_EMAIL, 
      from: process.env.SENDER_EMAIL,
      subject: "✅ Test Configurazione EasyCare",
      text: "Se ricevi questa email, SendGrid è configurato correttamente!"
    };

    await sgMail.send(testMsg);
    console.log("✅ Email di test inviata!");
    return true;
  } catch (error) {
    console.error("❌ Test fallito:", error);
    return false;
  }
};