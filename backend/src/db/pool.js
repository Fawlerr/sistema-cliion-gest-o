import pg from "pg";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

const { Pool } = pg;

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
  max: env.db.max,
  idleTimeoutMillis: env.db.idleTimeoutMs,
  connectionTimeoutMillis: env.db.connectionTimeoutMs,
  statement_timeout: env.db.statementTimeoutMs,
  query_timeout: env.db.queryTimeoutMs,
  keepAlive: true
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

pool.on("error", (error) => {
  logger.error("Unexpected PostgreSQL pool error", { message: error.message, stack: error.stack });
});

export async function initializeDatabase() {
  try {
    await pool.query("SELECT 1");
    const { ensureDatabaseSchema } = await import("./schema.js");
    await ensureDatabaseSchema();
    logger.info("Connected to PostgreSQL", {
      host: env.db.host,
      port: env.db.port,
      database: env.db.database,
      ssl: env.db.ssl
    });
  } catch (err) {
    logger.error("DB connection error", { message: err.message, stack: err.stack });
    throw err;
  }
}

export async function closeDatabase() {
  await pool.end();
}
