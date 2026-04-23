import { app } from "./app.js";
import { env } from "./config/env.js";
import { initializeDatabase } from "./db/pool.js";

async function startServer() {
  await initializeDatabase();

  app.listen(env.port, () => {
    console.log(`Cliion backend listening on http://localhost:${env.port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start backend:", err);
  process.exit(1);
});
