import { app } from "./src/app.js";
import { env } from "./src/config/env.js";
import { initializeDatabase, pool } from "./src/config/database.js";

let server;

async function startServer() {
  await initializeDatabase();
  server = app.listen(env.port, () => {
    console.log(`nassauTickets API rodando em http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Falha ao inicializar a API:", error);
  process.exit(1);
});

async function shutdown(signal) {
  console.log(`${signal}: encerrando servidor...`);
  if (!server) {
    process.exit(0);
    return;
  }

  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
