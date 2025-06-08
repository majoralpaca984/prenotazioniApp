# 🗓️ Appuntamenti Booking App

![Vercel](https://vercelbadge.vercel.app/api/EleonoraTroiani/Appuntamenti-booking-app)
![Render](https://img.shields.io/badge/Backend-Render-0e1525?logo=render&logoColor=white&style=flat)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-4EA94B?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

Gestione appuntamenti per studi medici, centri estetici, parrucchieri e professionisti.  
Prenota, modifica e gestisci gli appuntamenti in modo semplice e rapido.  
✨ **Full Stack App con React + Express + MongoDB**

---

## 📸 Anteprima

![screenshot](./screenshots/homePage.png)

> Schermata iniziale: l'utente può cercare una prestazione e selezionare una data per trovare medici disponibili. L’interfaccia è moderna, chiara e **responsive**, con **tema chiaro/scuro** attivabile.

---

## 📦 Tecnologie utilizzate

- ⚛️ React (Vite)
- 🎨 Bootstrap 5
- 🔐 JWT per l'autenticazione
- 🌍 Node.js + Express
- 🧾 MongoDB Atlas
- 🔐 Google OAuth 2.0
- ☁️ Vercel (frontend)
- 🛠 Render (backend)

---

## 🚀 Funzionalità

- ✅ Login / Registrazione utente classica
- ✅ Login con Google (OAuth 2.0)
- ✅ Ruoli: paziente 👤 / medico 👨‍⚕️
- ✅ Dashboard personale con gestione appuntamenti
- ✅ Calendario con appuntamenti visualizzati tramite indicatori colorati
- ✅ CRUD appuntamenti (Crea / Modifica / Elimina)
- ✅ Filtra appuntamenti per mese/anno (ottimizzazione caricamento)
- ✅ Tema chiaro / scuro 🌗 con toggle
- ✅ Ricerca per prestazione + selezione data 📅
- ✅ Design responsive mobile-first 📱
- ✅ Invio email conferma appuntamento 📧

---

## 🖥️ Installazione locale

### 1. Clona il repository

```bash
git clone https://github.com/TUO-USERNAME/Appuntamenti-booking-app.git
cd Appuntamenti-booking-app
```

### 2. Configura il backend

```bash
cd backend
npm install

# Crea un file .env e inserisci:
PORT=4000
MONGO_URL=<TUA_STRINGA_MONGODB>
JWT_SECRET=<TUA_SECRET>
GOOGLE_CLIENT_ID=<CLIENT_ID>
GOOGLE_CLIENT_SECRET=<CLIENT_SECRET>
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
EMAIL_SENDER=<email_registrata_su_sendgrid>
SENDGRID_API_KEY=<API_KEY_SENDGRID>

npm run dev
```

### 3. Avvia il frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🗂️ Struttura del progetto

```
Appuntamenti-booking-app/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── views/
│   │   ├── App.jsx
│   │   └── main.jsx
├── .env.example
├── README.md
```

---

## 👩‍💻 Autore

**Nome:** Eleonora Troiani  
**Email:** codwithele@gmail.com  
**GitHub:** [majoralpaca984](https://github.com/TUO-USERNAME)

---

## 📝 Licenza

MIT License