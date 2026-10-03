import { useEffect, useRef, useState } from "react";
import { useTickets } from "../hooks/useTickets";
import { ticketTypes } from "../types/ticket";
export default function AudioControl() {
  const { calls, available } = useTickets();
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const latest = calls[0];
  const lastSpoken = useRef(latest?.id);
  const supported = "speechSynthesis" in window;
  useEffect(() => {
    if (!latest || latest.id === lastSpoken.current) return;
    lastSpoken.current = latest.id;
    if (!enabled || !available || !supported) return;
    const speech = new SpeechSynthesisUtterance(
      `${latest.recall ? "Última chamada. " : ""}${ticketTypes[latest.type].title}. Senha ${latest.ticketId}. Guichê ${latest.counter}.`,
    );
    speech.lang = "pt-BR";
    speech.onerror = (event) => {
      if (!["interrupted", "canceled"].includes(event.error))
        setError("Áudio indisponível. Acompanhe a chamada visual.");
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  }, [latest, enabled, available, supported]);
  useEffect(
    () => () => {
      if (supported) window.speechSynthesis.cancel();
    },
    [supported],
  );
  return (
    <div className="audio-control">
      <button
        className="audio-button"
        disabled={!supported}
        aria-pressed={enabled}
        onClick={() => {
          setEnabled((value) => !value);
          setError("");
          if (enabled) window.speechSynthesis.cancel();
        }}
      >
        {enabled ? "Desativar áudio das chamadas" : "Ativar áudio das chamadas"}
      </button>
      <span role="status">
        {error ||
          (!supported
            ? "Áudio não suportado neste navegador."
            : "Áudio opcional nesta aba.")}
      </span>
    </div>
  );
}
