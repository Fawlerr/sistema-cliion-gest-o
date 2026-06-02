import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

const { Pool } = pg;

// Criar um pool de conexões para o Prisma usar
const pgPool = new Pool({
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
  keepAlive: true,
});

// Usar o adapter PrismaPg com o Pool
const adapter = new PrismaPg(pgPool);

// Instanciar o PrismaClient com o adapter
export const prisma = new PrismaClient({
  adapter,
});

// Event handlers
pgPool.on("error", (error) => {
  logger.error("Unexpected PostgreSQL pool error", {
    message: error.message,
    stack: error.stack,
  });
});

prisma.$on("query", (e) => {
  logger.debug("Query", {
    query: e.query,
    params: e.params,
    duration: `${e.duration}ms`,
  });
});

export async function initializePrisma() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Connected to PostgreSQL via Prisma", {
      host: env.db.host,
      port: env.db.port,
      database: env.db.database,
      ssl: env.db.ssl,
    });
  } catch (err) {
    logger.error("Prisma connection error", {
      message: err.message,
      stack: err.stack,
    });
    throw err;
  }
}

export async function closePrisma() {
  await prisma.$disconnect();
  await pgPool.end();
}
