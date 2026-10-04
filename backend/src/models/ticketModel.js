export async function createSequenceRow(connection, date, type) {
  await connection.query(
    `INSERT IGNORE INTO sequencias_diarias (data_emissao, tipo, ultimo_numero)
     VALUES (?, ?, 0)`,
    [date, type],
  );
}

export async function lockAndIncrementSequence(connection, date, type) {
  await createSequenceRow(connection, date, type);

  const [rows] = await connection.query(
    `SELECT ultimo_numero
       FROM sequencias_diarias
      WHERE data_emissao = ? AND tipo = ?
      FOR UPDATE`,
    [date, type],
  );

  const next = Number(rows[0].ultimo_numero) + 1;
  if (next > 999) return null;

  await connection.query(
    `UPDATE sequencias_diarias
        SET ultimo_numero = ?
      WHERE data_emissao = ? AND tipo = ?`,
    [next, date, type],
  );

  return next;
}

export async function insertTicket(connection, data) {
  const [result] = await connection.query(
    `INSERT INTO tickets (
       codigo_senha, tipo, sequencial, data_emissao, status,
       data_hora_emissao
     ) VALUES (?, ?, ?, ?, 'AGUARDANDO', ?)`,
    [
      data.codigoSenha,
      data.tipo,
      data.sequencial,
      data.dataEmissao,
      data.dataHoraEmissao,
    ],
  );
  return findById(connection, result.insertId);
}

export async function findById(connection, id) {
  const [rows] = await connection.query(
    `SELECT * FROM tickets WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findByCode(connection, code) {
  const [rows] = await connection.query(
    `SELECT * FROM tickets WHERE codigo_senha = ? LIMIT 1`,
    [code],
  );
  return rows[0] ?? null;
}

export async function findWaiting(connection, date, type) {
  const [rows] = await connection.query(
    `SELECT * FROM tickets
      WHERE data_emissao = ?
        AND tipo = ?
        AND status = 'AGUARDANDO'
      ORDER BY sequencial ASC
      LIMIT 1
      FOR UPDATE`,
    [date, type],
  );
  return rows[0] ?? null;
}

export async function findWaitingTypes(connection, date, types) {
  const placeholders = types.map(() => "?").join(",");
  const [rows] = await connection.query(
    `SELECT * FROM tickets
      WHERE data_emissao = ?
        AND tipo IN (${placeholders})
        AND status = 'AGUARDANDO'
      ORDER BY FIELD(tipo, 'SE', 'SG'), sequencial ASC
      LIMIT 1
      FOR UPDATE`,
    [date, ...types],
  );
  return rows[0] ?? null;
}

export async function lockQueueControl(connection, date) {
  await connection.query(
    `INSERT IGNORE INTO controle_fila (data_emissao, ultima_fila)
     VALUES (?, NULL)`,
    [date],
  );

  const [rows] = await connection.query(
    `SELECT data_emissao, ultima_fila
       FROM controle_fila
      WHERE data_emissao = ?
      FOR UPDATE`,
    [date],
  );
  return rows[0];
}

export async function setLastQueue(connection, date, value) {
  await connection.query(
    `UPDATE controle_fila SET ultima_fila = ? WHERE data_emissao = ?`,
    [value, date],
  );
}

export async function lockTicketById(connection, id) {
  const [rows] = await connection.query(
    `SELECT * FROM tickets WHERE id = ? FOR UPDATE`,
    [id],
  );
  return rows[0] ?? null;
}

export async function updateStatus(connection, id, status, fields = {}) {
  const columns = ["status = ?"];
  const values = [status];

  for (const [column, value] of Object.entries(fields)) {
    columns.push(`${column} = ?`);
    values.push(value);
  }

  values.push(id);
  await connection.query(
    `UPDATE tickets SET ${columns.join(", ")} WHERE id = ?`,
    values,
  );
  return findById(connection, id);
}

export async function findCurrentByCounter(connection, counterId) {
  const [rows] = await connection.query(
    `SELECT * FROM tickets
      WHERE guiche_id = ?
        AND status IN ('CHAMADA','CHAMADA_NOVAMENTE','EM_ATENDIMENTO')
      ORDER BY id DESC
      LIMIT 1`,
    [counterId],
  );
  return rows[0] ?? null;
}

export async function latestCalls(connection, limit = 5) {
  const [rows] = await connection.query(
    `SELECT e.id, e.acao, e.ocorrido_em, t.codigo_senha, t.tipo, e.guiche_id
       FROM eventos_atendimento e
       JOIN tickets t ON t.id = e.ticket_id
      WHERE e.acao IN ('CHAMADA','SEGUNDA_CHAMADA')
      ORDER BY e.ocorrido_em DESC, e.id DESC
      LIMIT ${Number(limit)}`,
  );
  return rows;
}

export async function snapshotTickets(connection, date) {
  const [rows] = await connection.query(
    `SELECT * FROM tickets WHERE data_emissao = ? ORDER BY id ASC`,
    [date],
  );
  return rows;
}

export async function auditUpsert(connection, ticket) {
  await connection.query(
    `INSERT INTO logs_auditoria (
       ticket_id, atendente_id, guiche_id,
       horario_primeira_chamada, horario_segunda_chamada,
       horario_inicio, horario_fim, status_final
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       atendente_id = VALUES(atendente_id),
       guiche_id = VALUES(guiche_id),
       horario_primeira_chamada = VALUES(horario_primeira_chamada),
       horario_segunda_chamada = VALUES(horario_segunda_chamada),
       horario_inicio = VALUES(horario_inicio),
       horario_fim = VALUES(horario_fim),
       status_final = VALUES(status_final)`,
    [
      ticket.id,
      ticket.atendente_id,
      ticket.guiche_id,
      ticket.primeira_chamada_em,
      ticket.segunda_chamada_em,
      ticket.inicio_atendimento_em,
      ticket.fim_atendimento_em,
      ticket.status,
    ],
  );
}

export async function insertEvent(connection, data) {
  await connection.query(
    `INSERT INTO eventos_atendimento
      (ticket_id, atendente_id, guiche_id, acao, ocorrido_em)
     VALUES (?, ?, ?, ?, ?)`,
    [data.ticketId, data.atendenteId ?? null, data.guicheId ?? null, data.acao, data.ocorridoEm],
  );
}

export async function reportSummary(connection, from, to) {
  const [rows] = await connection.query(
    `SELECT
       COUNT(*) AS emitidos,
       SUM(status = 'ATENDIDA') AS atendidos,
       SUM(tipo = 'SP') AS sp,
       SUM(tipo = 'SG') AS sg,
       SUM(tipo = 'SE') AS se,
       ROUND(AVG(
         CASE
           WHEN status = 'ATENDIDA'
           THEN TIMESTAMPDIFF(SECOND, inicio_atendimento_em, fim_atendimento_em)
         END
       ), 2) AS tempo_medio_atendimento_segundos,
       ROUND(AVG(
         CASE
           WHEN inicio_atendimento_em IS NOT NULL
           THEN TIMESTAMPDIFF(SECOND, data_hora_emissao, inicio_atendimento_em)
         END
       ), 2) AS tempo_medio_espera_segundos
     FROM tickets
     WHERE data_hora_emissao >= ? AND data_hora_emissao < ?`,
    [from, to],
  );
  return rows[0];
}

export async function reportDetails(connection, from, to) {
  const [rows] = await connection.query(
    `SELECT
       t.codigo_senha AS numero,
       t.tipo,
       t.status,
       t.data_hora_emissao AS emitida_em,
       t.primeira_chamada_em,
       t.segunda_chamada_em,
       t.inicio_atendimento_em AS inicio_atendimento,
       t.fim_atendimento_em AS fim_atendimento,
       t.guiche_id AS guiche,
       t.atendente_id
     FROM tickets t
     WHERE t.data_hora_emissao >= ? AND t.data_hora_emissao < ?
     ORDER BY t.data_hora_emissao DESC`,
    [from, to],
  );
  return rows;
}

export async function reportAudit(connection, from, to) {
  const [rows] = await connection.query(
    `SELECT
       l.id,
       t.codigo_senha AS senha,
       t.tipo,
       l.atendente_id,
       u.nome AS atendente,
       l.guiche_id AS guiche,
       l.horario_primeira_chamada,
       l.horario_segunda_chamada,
       l.horario_inicio,
       l.horario_fim,
       l.status_final
     FROM logs_auditoria l
     JOIN tickets t ON t.id = l.ticket_id
     LEFT JOIN usuarios u ON u.id = l.atendente_id
     WHERE t.data_hora_emissao >= ? AND t.data_hora_emissao < ?
     ORDER BY t.data_hora_emissao DESC`,
    [from, to],
  );
  return rows;
}
