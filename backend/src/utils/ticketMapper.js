export function mapTicket(row) {
  if (!row) return null;

  return {
    id: row.codigo_senha,
    databaseId: row.id,
    type: row.tipo,
    status: row.status === 'NAO_COMPARECEU' ? 'NÃO_COMPARECEU' : row.status,
    issuedAt: toIsoLike(row.data_hora_emissao),
    counter: row.guiche_id ?? undefined,
    attendantId: row.atendente_id ?? undefined,
    firstCallAt: toIsoLike(row.primeira_chamada_em),
    secondCallAt: toIsoLike(row.segunda_chamada_em),
    startedAt: toIsoLike(row.inicio_atendimento_em),
    finishedAt: toIsoLike(row.fim_atendimento_em),
  };
}

export function mapCall(row) {
  return {
    id: Number(row.id),
    ticketId: row.codigo_senha,
    type: row.tipo,
    counter: Number(row.guiche_id),
    at: toIsoLike(row.ocorrido_em),
    recall: row.acao === "SEGUNDA_CHAMADA",
  };
}

function toIsoLike(value) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return `${String(value).replace(" ", "T")}-03:00`;
}
