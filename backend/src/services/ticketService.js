import { pool } from "../config/database.js";
import { badRequest, notFound } from "../utils/httpError.js";
import { isBusinessHours, localDateParts } from "../utils/time.js";
import { mapCall, mapTicket } from "../utils/ticketMapper.js";
import * as ticketModel from "../models/ticketModel.js";
import * as guicheModel from "../models/guicheModel.js";
import * as userModel from "../models/userModel.js";

const TYPES = new Set(["SP", "SG", "SE"]);
const TRANSITIONS = {
  CHAMADA: {
    recall: "CHAMADA_NOVAMENTE",
    start: "EM_ATENDIMENTO",
  },
  CHAMADA_NOVAMENTE: {
    start: "EM_ATENDIMENTO",
    absent: "NAO_COMPARECEU",
  },
  EM_ATENDIMENTO: {
    finish: "ATENDIDA",
  },
};

export async function issue(type) {
  if (!TYPES.has(type)) throw badRequest("Tipo de senha inválido.");
  if (!isBusinessHours()) {
    throw badRequest("Expediente encerrado. A emissão está disponível das 7h às 17h.");
  }

  const now = new Date();
  const { date, yyMMdd } = localDateParts(now);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const sequence = await ticketModel.lockAndIncrementSequence(connection, date, type);
    if (!sequence) {
      throw badRequest("Limite diário da sequência atingido. Procure a recepção.");
    }

    const ticket = await ticketModel.insertTicket(connection, {
      codigoSenha: `${yyMMdd}-${type}${String(sequence).padStart(3, "0")}`,
      tipo: type,
      sequencial: sequence,
      dataEmissao: date,
      dataHoraEmissao: toMysqlDateTime(now),
    });

    await ticketModel.insertEvent(connection, {
      ticketId: ticket.id,
      acao: "EMISSAO",
      ocorridoEm: toMysqlDateTime(now),
    });
    await ticketModel.auditUpsert(connection, ticket);

    await connection.commit();
    return mapTicket(ticket);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function callNext({ guicheId, atendenteId }) {
  if (!isBusinessHours()) {
    throw badRequest("Expediente encerrado. Conclua apenas os atendimentos já iniciados.");
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const guiche = await guicheModel.findActiveById(connection, guicheId);
    if (!guiche) throw badRequest("Guichê inválido ou inativo.");

    const atendente = await userModel.findById(connection, atendenteId);
    if (!atendente?.ativo || !["ATENDENTE", "GESTOR"].includes(atendente.perfil)) {
      throw badRequest("Atendente inválido ou inativo.");
    }

    const current = await ticketModel.findCurrentByCounter(connection, guicheId);
    if (current) {
      throw badRequest("Conclua a senha atual antes de chamar a próxima.");
    }

    const { date } = localDateParts();
    const control = await ticketModel.lockQueueControl(connection, date);

    let next = null;
    if (control.ultima_fila === "SP") {
      next = await ticketModel.findWaitingTypes(connection, date, ["SE", "SG"]);
      if (!next) next = await ticketModel.findWaiting(connection, date, "SP");
    } else {
      next = await ticketModel.findWaiting(connection, date, "SP");
      if (!next) next = await ticketModel.findWaitingTypes(connection, date, ["SE", "SG"]);
    }

    if (!next) throw badRequest("Nenhuma senha aguardando.");

    const now = new Date();
    const updated = await ticketModel.updateStatus(
      connection,
      next.id,
      "CHAMADA",
      {
        guiche_id: guicheId,
        atendente_id: atendenteId,
        primeira_chamada_em: toMysqlDateTime(now),
      },
    );

    await ticketModel.setLastQueue(connection, date, next.tipo === "SP" ? "SP" : "NAO_SP");
    await ticketModel.insertEvent(connection, {
      ticketId: next.id,
      atendenteId,
      guicheId,
      acao: "CHAMADA",
      ocorridoEm: toMysqlDateTime(now),
    });
    await ticketModel.auditUpsert(connection, updated);

    await connection.commit();
    return mapTicket(updated);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function act(id, action, actorId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const ticket = await ticketModel.lockTicketById(connection, id);
    if (!ticket) throw notFound("Senha não encontrada.");

    const allowed = TRANSITIONS[ticket.status]?.[action];
    if (!allowed) {
      throw badRequest("Esta ação não é permitida no estado atual da senha.");
    }

    if (ticket.atendente_id && Number(ticket.atendente_id) !== Number(actorId)) {
      throw badRequest("A senha está vinculada a outro atendente.");
    }

    const now = new Date();
    const when = toMysqlDateTime(now);
    let fields = {};
    let eventAction;

    if (action === "recall") {
      fields.segunda_chamada_em = when;
      eventAction = "SEGUNDA_CHAMADA";
    } else if (action === "start") {
      fields.inicio_atendimento_em = when;
      eventAction = "INICIO";
    } else if (action === "finish") {
      fields.fim_atendimento_em = when;
      eventAction = "FIM";
    } else {
      eventAction = "AUSENCIA";
    }

    const updated = await ticketModel.updateStatus(connection, id, allowed, fields);

    await ticketModel.insertEvent(connection, {
      ticketId: id,
      atendenteId: updated.atendente_id ?? actorId,
      guicheId: updated.guiche_id,
      acao: eventAction,
      ocorridoEm: when,
    });
    await ticketModel.auditUpsert(connection, updated);

    await connection.commit();
    return mapTicket(updated);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function getPanel() {
  const connection = await pool.getConnection();
  try {
    const rows = await ticketModel.latestCalls(connection, 5);
    return rows.map(mapCall);
  } finally {
    connection.release();
  }
}

export async function getSnapshot() {
  const connection = await pool.getConnection();
  try {
    const { date } = localDateParts();
    const [tickets, calls] = await Promise.all([
      ticketModel.snapshotTickets(connection, date),
      ticketModel.latestCalls(connection, 5),
    ]);
    return {
      tickets: tickets.map(mapTicket),
      calls: calls.map(mapCall),
      available: true,
      open: isBusinessHours(),
    };
  } finally {
    connection.release();
  }
}

export async function closeUnstarted() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { date } = localDateParts();

    const [rows] = await connection.query(
      `SELECT * FROM tickets
        WHERE data_emissao = ?
          AND status IN ('AGUARDANDO','CHAMADA','CHAMADA_NOVAMENTE')
        FOR UPDATE`,
      [date],
    );

    const when = toMysqlDateTime(new Date());
    for (const ticket of rows) {
      const updated = await ticketModel.updateStatus(connection, ticket.id, "DESCARTADA");
      await ticketModel.insertEvent(connection, {
        ticketId: ticket.id,
        atendenteId: ticket.atendente_id,
        guicheId: ticket.guiche_id,
        acao: "DESCARTE",
        ocorridoEm: when,
      });
      await ticketModel.auditUpsert(connection, updated);
    }

    await connection.commit();
    return { descartadas: rows.length };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

function toMysqlDateTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
