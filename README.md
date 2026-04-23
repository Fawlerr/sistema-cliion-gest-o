# Cliion Dashboard

Production-oriented clinic dashboard for the existing Cliion application. This version replaces the mock backend flow with a modular PostgreSQL API and adds a multi-page React dashboard for patients, appointments, services, payments, expenses, and aggregated KPIs.

## Stack

- Backend: Node.js, Express, `pg`
- Frontend: React, Vite, Tailwind CSS, Recharts
- Database: PostgreSQL

## Backend API

Available endpoints:

- `GET /api/dashboard`
- `GET /api/users`
- `GET /api/users/:id`
- `GET /api/patients`
- `GET /api/patients/:id`
- `GET /api/services`
- `GET /api/services/:id`
- `GET /api/appointments`
- `GET /api/appointments/:id`
- `GET /api/payments`
- `GET /api/payments/:id`
- `GET /api/expenses`
- `GET /api/expenses/:id`

Backend folders:

```text
backend/src/
  config/
  controllers/
  db/
  lib/
  middleware/
  routes/
  services/
  app.js
  server.js
```

## Frontend

Implemented pages:

- Dashboard
- Patients
- Appointments
- Services
- Payments
- Expenses

Frontend folders:

```text
frontend/src/
  components/
  hooks/
  lib/
  pages/
  App.jsx
  index.css
  main.jsx
```

## Environment

Set `DATABASE_URL` to a valid PostgreSQL connection string.

This code also supports the current Prisma local format used in the repo, such as `prisma+postgres://...`, and automatically resolves the underlying Postgres URL before connecting.

Optional frontend env:

- `VITE_API_URL=http://localhost:4000/api`

## Run

1. Install dependencies

```bash
npm install
```

2. Make sure PostgreSQL is running and the existing clinic tables already exist:

- `users`
- `patients`
- `services`
- `appointments`
- `payments`
- `expenses`

3. Start the app

```bash
npm run dev
```

4. Open:

- Frontend: [http://localhost:5173](http://localhost:5173)
- API health: [http://localhost:4000/api/health](http://localhost:4000/api/health)

## Notes

- `GET /api/patients` supports `?search=...`
- `GET /api/appointments` supports `?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=200`
- The dashboard KPIs and charts are calculated from live database rows, not mock data
- Authentication is intentionally not included yet
