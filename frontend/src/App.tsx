import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useEffect, useRef } from "react";
import { useTickets } from "./hooks/useTickets";
import { ticketService } from "./services/ticketService";
import Totem from "./pages/Totem";
import Atendimento from "./pages/Atendimento";
import Painel from "./pages/Painel";
import AudioControl from "./components/AudioControl";
import "./theme/app.css";
function Shell() {
  const { available, open } = useTickets();
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    main.current?.focus({ preventScroll: true });
  }, [location.pathname]);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="app-header">
        <NavLink
          className="brand"
          to="/totem"
          aria-label="nassauTickets — início"
        >
          <span className="brand-icon" aria-hidden="true">
            n<span>+</span>
          </span>
          <span>
            nassau<strong>Tickets</strong>
            <small>Laboratório de análises clínicas</small>
          </span>
        </NavLink>
        <nav aria-label="Áreas do sistema">
          <NavLink to="/totem">Totem</NavLink>
          <NavLink to="/atendimento">Atendimento</NavLink>
          <NavLink to="/painel">Painel</NavLink>
        </nav>
        <span className={`connection ${available ? "" : "offline"}`}>
          <i aria-hidden="true" />
          {available ? "Demo local" : "Indisponível"}
        </span>
      </header>
      <div className="demo-bar">
        <span>
          <b>Demonstração</b> · Dados fictícios, somente nesta aba. Recarregar
          apaga a sessão. Sem login ou API.
        </span>
        <details>
          <summary>Controles da simulação</summary>
          <div className="demo-controls">
            <label>
              <input
                type="checkbox"
                checked={!available}
                onChange={(event) =>
                  ticketService.setAvailable(!event.target.checked)
                }
              />{" "}
              Simular indisponibilidade
            </label>
            <label>
              <input
                type="checkbox"
                checked={!open}
                onChange={(event) =>
                  ticketService.setOpen(!event.target.checked)
                }
              />{" "}
              Simular encerramento às 17h
            </label>
            <p>
              Encerra senhas ainda não iniciadas. Atendimentos em andamento
              podem ser concluídos. O relógio real não controla este protótipo.
            </p>
          </div>
        </details>
      </div>
      {!available && (
        <div className="outage" role="alert">
          Serviço simulado indisponível. Os dados exibidos podem estar
          desatualizados. Nenhuma operação será confirmada.
        </div>
      )}
      <main id="conteudo" ref={main} tabIndex={-1}>
        <Routes>
          <Route path="/totem" element={<Totem />} />
          <Route path="/atendimento" element={<Atendimento />} />
          <Route path="/painel" element={<Painel />} />
          <Route path="/" element={<Navigate to="/totem" replace />} />
          <Route
            path="*"
            element={
              <section className="surface">
                <h1>Página não encontrada</h1>
                <NavLink to="/totem">Voltar ao totem</NavLink>
              </section>
            }
          />
        </Routes>
      </main>
      <footer className="app-footer">
        <span>nassauTickets / Cuidado que começa na chegada.</span>
        <AudioControl />
        <span>Projeto acadêmico · Frontend demonstrativo</span>
      </footer>
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Shell />
    </BrowserRouter>
  );
}
