import { useState } from "react";
import Heading from "../components/Heading";
import { useCommand, useTickets } from "../hooks/useTickets";
import { ticketService } from "../services/ticketService";
import { statusLabels, ticketTypes, type TicketAction } from "../types/ticket";
export default function Atendimento() {
  const { tickets, open } = useTickets();
  const [counter, setCounter] = useState(1);
  const [message, setMessage] = useState("");
  const [confirmAbsent, setConfirmAbsent] = useState(false);
  const { busy, error, run } = useCommand();
  const waiting = tickets.filter((ticket) => ticket.status === "AGUARDANDO");
  const current = tickets.find(
    (ticket) =>
      ticket.counter === counter &&
      ["CHAMADA", "CHAMADA_NOVAMENTE", "EM_ATENDIMENTO"].includes(
        ticket.status,
      ),
  );
  const act = (action: TicketAction) =>
    current &&
    void run(
      () => ticketService.act(current.id, action),
      (updated) => {
        setMessage(`${updated.id}: ${statusLabels[updated.status]}.`);
        setConfirmAbsent(false);
      },
    );
  return (
    <>
      <Heading
        eyebrow="02 / Operação"
        title="Um atendimento de cada vez."
        description="Chame a próxima senha e acompanhe cada etapa no seu guichê."
      />
      <div className="stats">
        <div>
          <span>Na espera</span>
          <strong>{waiting.length.toString().padStart(2, "0")}</strong>
        </div>
        <div>
          <span>Concluídos</span>
          <strong>
            {tickets
              .filter((t) => t.status === "ATENDIDA")
              .length.toString()
              .padStart(2, "0")}
          </strong>
        </div>
        <div>
          <span>Emitidos nesta sessão</span>
          <strong>{tickets.length.toString().padStart(2, "0")}</strong>
        </div>
      </div>
      <div className="operator-layout">
        <section className="surface">
          <div className="section-top">
            <h2>Seu guichê</h2>
            <label className="counter-label">
              Guichê{" "}
              <select
                value={counter}
                disabled={busy}
                onChange={(event) => {
                  setCounter(Number(event.target.value));
                  setMessage("");
                  setConfirmAbsent(false);
                }}
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {String(n).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {current ? (
            <div className="current-ticket">
              <span className="status-pill">
                {statusLabels[current.status]}
              </span>
              <h3 className="ticket-number">{current.id}</h3>
              <p>{ticketTypes[current.type].title}</p>
              <div className="actions">
                {["CHAMADA", "CHAMADA_NOVAMENTE"].includes(current.status) && (
                  <button
                    className="primary"
                    disabled={busy}
                    onClick={() => act("start")}
                  >
                    Iniciar atendimento
                  </button>
                )}
                {current.status === "CHAMADA" && (
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() => act("recall")}
                  >
                    Chamar novamente
                  </button>
                )}
                {current.status === "EM_ATENDIMENTO" && (
                  <button
                    className="primary"
                    disabled={busy}
                    onClick={() => act("finish")}
                  >
                    Finalizar atendimento
                  </button>
                )}
                {current.status === "CHAMADA_NOVAMENTE" && (
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() => setConfirmAbsent(true)}
                  >
                    Cliente não compareceu
                  </button>
                )}
              </div>
              {confirmAbsent && current.status === "CHAMADA_NOVAMENTE" && (
                <div className="notice">
                  <p>
                    Confirma que o cliente não compareceu após as duas chamadas?
                  </p>
                  <div className="actions">
                    <button
                      className="danger"
                      disabled={busy}
                      onClick={() => act("absent")}
                    >
                      Confirmar ausência
                    </button>
                    <button
                      className="secondary"
                      disabled={busy}
                      onClick={() => setConfirmAbsent(false)}
                    >
                      Continuar aguardando
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-symbol" aria-hidden="true">
                ↗
              </span>
              <h3>{open ? "Pronto para receber." : "Expediente encerrado."}</h3>
              <p>
                {waiting.length
                  ? "A seleção respeita a prioridade e a ordem de chegada de cada tipo."
                  : "Nenhuma senha aguardando neste momento."}
              </p>
              <button
                className="primary"
                disabled={busy || !open || !waiting.length}
                onClick={() =>
                  void run(
                    () => ticketService.callNext(counter),
                    (next) => setMessage(`Senha ${next.id} chamada.`),
                  )
                }
              >
                {busy ? "Chamando…" : "Chamar próxima senha"}
              </button>
            </div>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <p className="small muted" role="status">
            {message}
          </p>
        </section>
        <aside className="surface queue-summary">
          <p className="eyebrow">Visão da espera</p>
          <h2>Fila por serviço</h2>
          {Object.entries(ticketTypes).map(([type, info]) => (
            <div className="queue-row" key={type}>
              <span className="type-stamp">{type}</span>
              <span>{info.title}</span>
              <strong>{waiting.filter((t) => t.type === type).length}</strong>
            </div>
          ))}
          <p className="small muted">
            Regra provisória: alternar SP com SE ou SG. Entre as não
            prioritárias, SE vem antes de SG. A próxima senha só é definida ao
            chamar.
          </p>
        </aside>
      </div>
    </>
  );
}
