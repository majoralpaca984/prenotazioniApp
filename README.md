# EasyCare — Prenotazioni online

Applicazione full stack dimostrativa per creare e gestire appuntamenti. Il progetto include autenticazione, profilo utente, dashboard, calendario e operazioni CRUD.

**Demo:** [prenotazioni-online.vercel.app](https://prenotazioni-online.vercel.app)

## Funzioni implementate

- registrazione e accesso con email e password;
- accesso con Google Identity Services;
- autenticazione tramite JWT e rotte protette;
- creazione, modifica ed eliminazione degli appuntamenti;
- controllo degli orari e prevenzione di appuntamenti sovrapposti;
- dashboard con riepilogo e prossimi appuntamenti;
- calendario mensile e stati `scheduled`, `completed`, `cancelled`;
- aggiornamento del profilo e cambio password;
- email di conferma opzionale tramite SendGrid;
- tema chiaro/scuro e interfaccia responsive.

I profili dei medici e le disponibilità mostrati nella home sono dati dimostrativi. Il progetto non elabora pagamenti e non archivia documenti sanitari.

## Tecnologie

| Area | Tecnologie |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB |
| Autenticazione | JWT, bcrypt, Google Identity Services |
| Email | SendGrid (opzionale) |
| Deploy | Vercel e Render |

## Struttura

```text
prenotazioniApp/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── services/
│       ├── utils/
│       └── views/
└── screenshots/
```

## Avvio locale

Requisiti: Node.js 20 o successivo e un database MongoDB.

```bash
git clone https://github.com/majoralpaca984/prenotazioniApp.git
cd prenotazioniApp

cd backend
cp .env.example .env
npm install
npm run dev
```

In un secondo terminale:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Il frontend usa `http://localhost:5173`; il backend usa `http://localhost:4000`.

## Variabili d'ambiente

Backend (`backend/.env`):

```env
PORT=4000
MONGO_URL=mongodb://127.0.0.1:27017/easycare
JWT_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=
SENDGRID_API_KEY=
SENDER_EMAIL=
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
```

Frontend (`frontend/.env`):

```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=
```

Google e SendGrid sono opzionali per lo sviluppo locale. Registrazione e accesso tramite email funzionano senza questi servizi.

## Comandi utili

Dalla root del repository:

```bash
npm run build
npm run lint
npm run check:backend
```

Avvio dei singoli ambienti:

```bash
npm run dev:frontend
npm run dev:backend
```

## API principali

| Metodo | Endpoint | Autenticazione |
| --- | --- | --- |
| `POST` | `/auth/register` | No |
| `POST` | `/auth/login` | No |
| `POST` | `/auth/google-login` | No |
| `GET`, `PUT` | `/auth/profile` | JWT |
| `PUT` | `/auth/change-password` | JWT |
| `GET`, `POST` | `/appointments` | JWT |
| `GET`, `PUT`, `DELETE` | `/appointments/:id` | JWT |
