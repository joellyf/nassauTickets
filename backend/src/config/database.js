import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { env } from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  namedPlaceholders: false,
});

export async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    timezone: env.db.timezone,
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.db.database}\``);
    await connection.query(`USE \`${env.db.database}\``);

    const schemaPath = path.resolve(__dirname, "../../schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    const requiredTables = [
      "usuarios",
      "guiches",
      "tickets",
      "logs_auditoria",
      "eventos_atendimento",
      "sequencias_diarias",
      "controle_fila",
    ];

    const [tableRows] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()",
    );
    const detectedTables = new Set(tableRows.map((row) => row.TABLE_NAME));

    if (detectedTables.size === 0) {
      const statements = schemaSql
        .split(";")
        .map((statement) => statement.trim())
        .filter(Boolean)
        .filter((statement) => !statement.toUpperCase().startsWith("CREATE DATABASE") && !statement.toUpperCase().startsWith("USE "));

      for (const statement of statements) {
        await connection.query(statement);
      }
      return;
    }

    const missingTables = requiredTables.filter((name) => !detectedTables.has(name));
    if (missingTables.length > 0) {
      throw new Error(`Schema incompatível: tabelas ausentes (${missingTables.join(", ")}). Nenhum dado foi removido.`);
    }

    {
      const [ticketColumns] = await connection.query("SHOW COLUMNS FROM tickets");
      const ticketColumnsNames = ticketColumns.map((column) => column.Field);
      const expectedTicketColumns = [
        "id",
        "codigo_senha",
        "tipo",
        "sequencial",
        "data_emissao",
        "status",
        "data_hora_emissao",
        "primeira_chamada_em",
        "segunda_chamada_em",
        "inicio_atendimento_em",
        "fim_atendimento_em",
        "guiche_id",
        "atendente_id",
        "criado_em",
      ];
      const missingTicketColumns = expectedTicketColumns.filter((column) => !ticketColumnsNames.includes(column));
      if (missingTicketColumns.length > 0) {
        throw new Error(`Schema incompatível: colunas ausentes em tickets (${missingTicketColumns.join(", ")}). Nenhum dado foi removido.`);
      }
    }

  } finally {
    await connection.end();
  }
}

export async function pingDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query("SELECT 1 AS ok");
    return true;
  } finally {
    connection.release();
  }
}
