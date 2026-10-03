import { useRef, useState, useSyncExternalStore } from "react";
import { ticketService } from "../services/ticketService";
export function useTickets() {
  return useSyncExternalStore(
    ticketService.subscribe,
    ticketService.getSnapshot,
  );
}
export function useCommand() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run<T>(
    command: () => Promise<T>,
    success?: (value: T) => void,
  ) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const value = await command();
      success?.(value);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível concluir a operação.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { busy, error, run };
}
