import { pool } from "../config/database.js";
import * as ticketModel from "../models/ticketModel.js";

function range(period, from, to) {
  if (from && to) return { from: `${from} 00:00:00`, to: `${to} 00:00:00` };

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (period === "month") {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    return { from: mysqlDate(start), to: mysqlDate(end) };
  }

  const start = new Date(year, month, now.getDate());
  const end = new Date(year, month, now.getDate() + 1);
  return { from: mysqlDate(start), to: mysqlDate(end) };
}

export async function getReport(filters) {
  const { from, to } = range(filters.period, filters.from, filters.to);
  const connection = await pool.getConnection();
  try {
    const [summary, details, audit] = await Promise.all([
      ticketModel.reportSummary(connection, from, to),
      ticketModel.reportDetails(connection, from, to),
      ticketModel.reportAudit(connection, from, to),
    ]);
    return { period: { from, to }, summary, details, audit };
  } finally {
    connection.release();
  }
}

function mysqlDate(date) {
  const p = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}
