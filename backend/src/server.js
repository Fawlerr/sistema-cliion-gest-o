import { app } from "./app.js";
import { env } from "./config/env.js";
import { closeDatabase, initializeDatabase } from "./db/pool.js";
import { logger } from "./lib/logger.js";

async function startServer() {
  await initializeDatabase();

  const server = app.listen(env.port, () => {
    logger.info("Cliion backend listening", {
      port: env.port,
      nodeEnv: env.nodeEnv
    });
  });

  async function shutdown(signal) {
    logger.warn("Shutdown signal received", { signal });
    server.close(async () => {
      await closeDatabase();
      logger.info("HTTP server closed");
      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((err) => {
  logger.error("Failed to start backend", { message: err.message, stack: err.stack });
  process.exit(1);
});
