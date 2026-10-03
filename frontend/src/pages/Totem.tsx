import { useState } from "react";
import Heading from "../components/Heading";
import { useCommand, useTickets } from "../hooks/useTickets";
import { ticketService } from "../services/ticketService";
import { ticketTypes, type Ticket, type TicketType } from "../types/ticket";
export default function Totem() {
  const { open } = useTickets();
  const { busy, error, run } = useCommand();
  const [issued, setIssued] = useState<Ticket | null>(null);
  return (
    <>
      <Heading
        eyebrow="01 / Recepção"
        title="Seu atendimento começa aqui."
        description="Escolha o serviço, retire sua senha e acompanhe a chamada no painel."
      />
      <div className="totem-layout">
        <section aria-label="Emissão de senha">
          {!open && (
            <p className="notice" role="status">
              Expediente encerrado. Voltamos a emitir senhas às 7h.
            </p>
          )}
          {issued ? (
            <div className="receipt" role="status">
              <span className="success-mark" aria-hidden="true">
                ✓
              </span>
              <p className="eyebrow">Senha emitida</p>
              <h2>Pronto. Agora é só aguardar.</h2>
              <p>{ticketTypes[issued.type].title}</p>
              <strong className="ticket-number">{issued.id}</strong>
              <p>A chamada informará o seu guichê. Anote sua senha.</p>
              <button className="primary" onClick={() => setIssued(null)}>
                Voltar ao início
              </button>
            </div>
          ) : (
            <div className="ticket-options">
              {(Object.keys(ticketTypes) as TicketType[]).map((type, index) => (
                <button
                  key={type}
                  className={`ticket-option option-${type}`}
                  disabled={busy || !open}
                  onClick={() =>
                    void run(() => ticketService.issue(type), setIssued)
                  }
                >
                  <span className="type-stamp">{type}</span>
                  <span className="option-copy">
                    <strong>{ticketTypes[type].title}</strong>
                    <span>{ticketTypes[type].description}</span>
                  </span>
                  <span className="option-arrow" aria-hidden="true">
                    {busy ? "…" : "↗"}
                  </span>
                  <span className="option-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                </button>
              ))}
              <p className="small muted" aria-live="polite">
                {busy
                  ? "Emitindo sua senha…"
                  : "Não é necessário informar nome, CPF ou qualquer dado pessoal."}
              </p>
            </div>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </section>
        <aside className="welcome-card">
          <div className="cross-motif" aria-hidden="true">
            +
          </div>
          <p className="eyebrow">Cuidado em cada etapa</p>
          <h2>
            Mais clareza.
            <br />
            Uma espera tranquila.
          </h2>
          <ol>
            <li>Escolha seu atendimento.</li>
            <li>Anote a senha emitida.</li>
            <li>Aguarde a chamada e vá ao guichê indicado.</li>
          </ol>
          <div className="hours">
            <span>Horário de atendimento</span>
            <strong>7h — 17h</strong>
          </div>
        </aside>
      </div>
    </>
  );
}
