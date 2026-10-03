import Heading from "../components/Heading";
import { useTickets } from "../hooks/useTickets";
import { ticketTypes } from "../types/ticket";
export default function Painel() {
  const { calls } = useTickets();
  const latest = calls[0];
  return (
    <>
      <Heading
        eyebrow="03 / Painel de chamadas"
        title="É a sua vez?"
        description="Acompanhe sua senha e dirija-se ao guichê indicado quando for chamado."
      />
      <div className="panel-layout">
        <section className="call-display" aria-live="polite" aria-atomic="true">
          <p className="eyebrow">
            {latest?.recall ? "Última chamada" : "Chamada mais recente"}
          </p>
          {latest ? (
            <>
              <span className="call-type">
                {ticketTypes[latest.type].title}
              </span>
              <h2>{latest.ticketId}</h2>
              <div className="counter-display">
                <span>Dirija-se ao guichê</span>
                <strong>{String(latest.counter).padStart(2, "0")}</strong>
                <span aria-hidden="true">↗</span>
              </div>
            </>
          ) : (
            <div className="panel-empty">
              <h2>
                Aguardando
                <br />a primeira chamada.
              </h2>
              <p>Quando um atendimento for chamado, a senha aparecerá aqui.</p>
            </div>
          )}
        </section>
        <section className="surface history">
          <h2>Últimas chamadas</h2>
          <p className="small muted">Até 5 chamadas realizadas</p>
          {!calls.length ? (
            <p className="empty-history">
              O histórico aparecerá após a primeira chamada.
            </p>
          ) : (
            <ol>
              {calls.map((call) => (
                <li key={call.id}>
                  <div>
                    <strong>{call.ticketId}</strong>
                    <span>
                      {call.recall
                        ? "Última chamada"
                        : ticketTypes[call.type].title}
                    </span>
                  </div>
                  <span className="history-counter">
                    Guichê <b>{String(call.counter).padStart(2, "0")}</b>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
      <p className="panel-bottom muted small">
        Por privacidade, o painel exibe apenas senhas e guichês. Nenhuma senha é
        antecipada antes da chamada.
      </p>
    </>
  );
}
