export async function findActiveById(connection, id) {
  const [rows] = await connection.query(
    `SELECT id, identificacao, ativo FROM guiches WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function list(connection) {
  const [rows] = await connection.query(
    `SELECT id, identificacao, ativo FROM guiches ORDER BY id`,
  );
  return rows;
}
