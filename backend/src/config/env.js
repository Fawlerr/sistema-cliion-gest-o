import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const projectRoot = path.resolve(currentDir, "..", "..", "..");

function parseEnvFile(content) {
  return content.split(/\r?\n/).reduce((accumulator, line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return accumulator;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      return accumulator;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

    accumulator[key] = value;
    return accumulator;
  }, {});
}

function loadRootEnv() {
  const candidatePaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "..", ".env"),
    path.resolve(projectRoot, ".env")
  ];

  const envPath = candidatePaths.find((candidate) => fs.existsSync(candidate));

  if (!envPath) {
    return {};
  }

  return parseEnvFile(fs.readFileSync(envPath, "utf8"));
}

function decodePrismaPostgresUrl(connectionValue) {
  if (!connectionValue?.startsWith("prisma+postgres://")) {
    return connectionValue || "";
  }

  const prismaUrl = new URL(connectionValue);
  const apiKey = prismaUrl.searchParams.get("api_key");

  if (!apiKey) {
    throw new Error("Invalid prisma+postgres DATABASE_URL: missing api_key.");
  }

  const payload = JSON.parse(Buffer.from(apiKey.split(".")[1] || apiKey, "base64url").toString("utf8"));
  const directUrl = payload.databaseUrl || payload.databaseURL;

  if (!directUrl) {
    throw new Error("Invalid prisma+postgres DATABASE_URL: unable to resolve direct Postgres URL.");
  }

  return directUrl;
}

function parseDatabaseUrl(connectionValue) {
  if (!connectionValue) {
    return null;
  }

  const decodedUrl = decodePrismaPostgresUrl(connectionValue);
  const databaseUrl = new URL(decodedUrl);

  return {
    host: databaseUrl.hostname || "127.0.0.1",
    port: Number(databaseUrl.port || 5432),
    user: decodeURIComponent(databaseUrl.username || "postgres"),
    password: decodeURIComponent(databaseUrl.password || ""),
    database: decodeURIComponent(databaseUrl.pathname.replace(/^\//, "") || "postgres"),
    ssl: databaseUrl.searchParams.get("sslmode") === "require"
  };
}

function buildDatabaseConfig(fileEnv) {
  const parsedUrlConfig = parseDatabaseUrl(process.env.DATABASE_URL || fileEnv.DATABASE_URL || "");
  const sslValue = process.env.DB_SSL || fileEnv.DB_SSL || String(parsedUrlConfig?.ssl || "false");

  return {
    host: process.env.DB_HOST || fileEnv.DB_HOST || parsedUrlConfig?.host || "localhost",
    port: Number(process.env.DB_PORT || fileEnv.DB_PORT || parsedUrlConfig?.port || 5432),
    user: process.env.DB_USER || fileEnv.DB_USER || parsedUrlConfig?.user || "postgres",
    password: process.env.DB_PASSWORD || fileEnv.DB_PASSWORD || parsedUrlConfig?.password || "",
    database: process.env.DB_NAME || fileEnv.DB_NAME || parsedUrlConfig?.database || "postgres",
    ssl: sslValue === "true",
    connectionString: process.env.DATABASE_URL || fileEnv.DATABASE_URL || "",
    max: Number(process.env.DB_POOL_MAX || fileEnv.DB_POOL_MAX || 10),
    idleTimeoutMs: Number(process.env.DB_IDLE_TIMEOUT_MS || fileEnv.DB_IDLE_TIMEOUT_MS || 30000),
    connectionTimeoutMs: Number(process.env.DB_CONNECTION_TIMEOUT_MS || fileEnv.DB_CONNECTION_TIMEOUT_MS || 10000),
    statementTimeoutMs: Number(process.env.DB_STATEMENT_TIMEOUT_MS || fileEnv.DB_STATEMENT_TIMEOUT_MS || 15000),
    queryTimeoutMs: Number(process.env.DB_QUERY_TIMEOUT_MS || fileEnv.DB_QUERY_TIMEOUT_MS || 15000)
  };
}

const fileEnv = loadRootEnv();
const db = buildDatabaseConfig(fileEnv);
const allowedOrigins = (process.env.CORS_ORIGINS || fileEnv.CORS_ORIGINS || "https://cliion.cloud,https://www.cliion.cloud")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const frontendPublicUrl = process.env.FRONTEND_PUBLIC_URL || fileEnv.FRONTEND_PUBLIC_URL || "https://cliion.cloud";

export const env = {
  nodeEnv: process.env.NODE_ENV || fileEnv.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || fileEnv.NODE_ENV || "development") === "production",
  port: Number(process.env.PORT || fileEnv.PORT || 3000),
  corsOrigins: allowedOrigins,
  frontendPublicUrl,
  trustProxy: process.env.TRUST_PROXY || fileEnv.TRUST_PROXY || "1",
  db,
  auth: {
    jwtSecret: process.env.JWT_SECRET || fileEnv.JWT_SECRET || "change-this-jwt-secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || fileEnv.JWT_EXPIRES_IN || "7d"
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || fileEnv.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || fileEnv.RATE_LIMIT_MAX || 300)
  }
};
