import { query } from "./pool.js";

export async function ensureDatabaseSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role INTEGER NOT NULL DEFAULT 2 CHECK (role IN (1, 2)),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role INTEGER`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
  await query(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 2`);
  await query(`UPDATE users SET role = 2 WHERE role IS NULL`);
  await query(`UPDATE users SET created_at = NOW() WHERE created_at IS NULL`);
  await query(`UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL`);
  await query(`CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_lower_idx ON users (LOWER(email))`);

  await query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto
  `);

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

  await query(`CREATE INDEX IF NOT EXISTS idx_appointment_links_token ON appointment_links(token)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_appointment_links_created_by ON appointment_links(created_by)`);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_appointment_links_active
    ON appointment_links(active, used)
    WHERE active = true AND used = false
  `);
}
