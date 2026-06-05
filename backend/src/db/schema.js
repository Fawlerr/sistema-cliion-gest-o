import { query } from "./pool.js";

export async function ensureDatabaseSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      "passwordHash" TEXT,
      role INTEGER NOT NULL DEFAULT 2 CHECK (role IN (1, 2)),
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "passwordHash" TEXT`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role INTEGER`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
  await query(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 2`);
  await query(`UPDATE users SET role = 2 WHERE role IS NULL`);
  await query(`UPDATE users SET "passwordHash" = password_hash WHERE "passwordHash" IS NULL AND password_hash IS NOT NULL`);
  await query(`UPDATE users SET password_hash = "passwordHash" WHERE password_hash IS NULL AND "passwordHash" IS NOT NULL`);
  await query(`UPDATE users SET "createdAt" = created_at WHERE "createdAt" IS NULL AND created_at IS NOT NULL`);
  await query(`UPDATE users SET "updatedAt" = updated_at WHERE "updatedAt" IS NULL AND updated_at IS NOT NULL`);
  await query(`UPDATE users SET created_at = NOW() WHERE created_at IS NULL`);
  await query(`UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL`);
  await query(`UPDATE users SET "createdAt" = NOW() WHERE "createdAt" IS NULL`);
  await query(`UPDATE users SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL`);
  await query(`CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_lower_idx ON users (LOWER(email))`);

  await query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      "birthDate" DATE,
      address TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS name TEXT`);
  await query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS email TEXT`);
  await query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone TEXT`);
  await query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS "birthDate" DATE`);
  await query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS address TEXT`);
  await query(`ALTER TABLE patients ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`);

  await query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC(12, 2) NOT NULL DEFAULT 0,
      "durationMinutes" INTEGER,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS name TEXT`);
  await query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT`);
  await query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS price NUMERIC(12, 2) NOT NULL DEFAULT 0`);
  await query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS "durationMinutes" INTEGER`);
  await query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`);

  await query(
    `
      INSERT INTO services (name, description, price, "durationMinutes")
      SELECT seed.name, seed.description, seed.price, seed."durationMinutes"
      FROM (
        VALUES
          ('Avaliação fisioterapêutica', 'Avaliação inicial para entender histórico, queixa principal e plano terapêutico.', 180::numeric, 60),
          ('Sessão de fisioterapia', 'Atendimento individual com foco em reabilitação, mobilidade e controle de dor.', 150::numeric, 60),
          ('Osteopatia', 'Atendimento manual para avaliação e tratamento de disfunções corporais.', 220::numeric, 60),
          ('Fisioterapia pélvica', 'Atendimento especializado para saúde pélvica e funcionalidade.', 200::numeric, 60)
      ) AS seed(name, description, price, "durationMinutes")
      WHERE NOT EXISTS (SELECT 1 FROM services WHERE LOWER(services.name) = LOWER(seed.name))
    `
  );

  await query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "patientId" TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      "serviceId" INTEGER NOT NULL REFERENCES services(id),
      "userId" INTEGER REFERENCES users(id),
      "appointmentDate" DATE NOT NULL,
      "appointmentTime" TIME NOT NULL,
      status TEXT,
      notes TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "patientId" TEXT`);
  await query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "serviceId" INTEGER`);
  await query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "userId" INTEGER`);
  await query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "appointmentDate" DATE`);
  await query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "appointmentTime" TIME`);
  await query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status TEXT`);
  await query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT`);
  await query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`);

  await query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      "appointmentId" TEXT REFERENCES appointments(id) ON DELETE SET NULL,
      amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
      method TEXT,
      status TEXT,
      "paidAt" TIMESTAMPTZ,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS "appointmentId" TEXT`);
  await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount NUMERIC(12, 2) NOT NULL DEFAULT 0`);
  await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS method TEXT`);
  await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS status TEXT`);
  await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMPTZ`);
  await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`);

  await query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      description TEXT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
      "expenseDate" DATE NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS description TEXT`);
  await query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS amount NUMERIC(12, 2) NOT NULL DEFAULT 0`);
  await query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS "expenseDate" DATE`);
  await query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`);

  await query(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id TEXT PRIMARY KEY,
      "patientId" TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      date DATE NOT NULL,
      notes TEXT,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS "patientId" TEXT`);
  await query(`ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS type TEXT`);
  await query(`ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS date DATE`);
  await query(`ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS notes TEXT`);
  await query(`ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb`);
  await query(`ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`);

  await query(`CREATE INDEX IF NOT EXISTS appointments_date_time_idx ON appointments ("appointmentDate", "appointmentTime")`);
  await query(`CREATE INDEX IF NOT EXISTS medical_records_patient_date_idx ON medical_records ("patientId", date DESC)`);

  await query(`
    CREATE TABLE IF NOT EXISTS appointment_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token TEXT UNIQUE NOT NULL,
      patient_id TEXT,
      service_id INTEGER,
      expires_at TIMESTAMPTZ,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      config JSONB,
      created_by INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`ALTER TABLE appointment_links ADD COLUMN IF NOT EXISTS token TEXT`);
  await query(`ALTER TABLE appointment_links ADD COLUMN IF NOT EXISTS patient_id TEXT`);
  await query(`ALTER TABLE appointment_links ADD COLUMN IF NOT EXISTS service_id INTEGER`);
  await query(`ALTER TABLE appointment_links ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ`);
  await query(`ALTER TABLE appointment_links ADD COLUMN IF NOT EXISTS used BOOLEAN NOT NULL DEFAULT FALSE`);
  await query(`ALTER TABLE appointment_links ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE`);
  await query(`ALTER TABLE appointment_links ADD COLUMN IF NOT EXISTS config JSONB`);
  await query(`ALTER TABLE appointment_links ADD COLUMN IF NOT EXISTS created_by INTEGER`);
  await query(`ALTER TABLE appointment_links ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);

  await query(`CREATE INDEX IF NOT EXISTS idx_appointment_links_token ON appointment_links(token)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_appointment_links_created_by ON appointment_links(created_by)`);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_appointment_links_active
    ON appointment_links(active, used)
    WHERE active = true AND used = false
  `);
}
