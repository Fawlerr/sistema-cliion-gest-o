import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

export const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  ssl: env.db.ssl ? { rejectUnauthorized: false } : false
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function initializeDatabase() {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL");
  } catch (err) {
    console.error("DB CONNECTION ERROR:", err);
    throw err;
  }
}
