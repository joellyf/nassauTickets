export async function findByEmail(connection, email) {
  const [rows] = await connection.query(
    `SELECT id, nome, email, senha_hash, perfil, ativo
       FROM usuarios
      WHERE email = ?
      LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findById(connection, id) {
  const [rows] = await connection.query(
    `SELECT id, nome, email, perfil, ativo, criado_em
       FROM usuarios
      WHERE id = ?
      LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function list(connection) {
  const [rows] = await connection.query(
    `SELECT id, nome, email, perfil, ativo, criado_em
       FROM usuarios
      ORDER BY nome`,
  );
  return rows;
}

export async function create(connection, { nome, email, senhaHash, perfil }) {
  const [result] = await connection.query(
    `INSERT INTO usuarios (nome, email, senha_hash, perfil)
     VALUES (?, ?, ?, ?)`,
    [nome, email, senhaHash, perfil],
  );
  return findById(connection, result.insertId);
}
