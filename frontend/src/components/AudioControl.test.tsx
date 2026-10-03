import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import AudioControl from "./AudioControl";
import { ticketService } from "../services/ticketService";
afterEach(() => vi.unstubAllGlobals());
test("anuncia somente novas chamadas, com prioridade, senha, guichê e última chamada", async () => {
  const speak = vi.fn();
  vi.stubGlobal("speechSynthesis", { speak, cancel: vi.fn() });
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class {
      lang = "";
      constructor(public text: string) {}
    },
  );
  const ticket = await ticketService.issue("SP");
  const view = render(<AudioControl />);
  fireEvent.click(
    screen.getByRole("button", { name: "Ativar áudio das chamadas" }),
  );
  expect(speak).not.toHaveBeenCalled();
  await act(async () => {
    await ticketService.callNext(1);
  });
  expect(speak).toHaveBeenCalledTimes(1);
  expect(speak.mock.calls[0][0].text).toContain(
    `Atendimento prioritário. Senha ${ticket.id}. Guichê 1.`,
  );
  expect(speak.mock.calls[0][0].lang).toBe("pt-BR");
  view.rerender(<AudioControl />);
  expect(speak).toHaveBeenCalledTimes(1);
  await act(async () => {
    await ticketService.act(ticket.id, "recall");
  });
  expect(speak).toHaveBeenCalledTimes(2);
  expect(speak.mock.calls[1][0].text).toContain("Última chamada.");
  view.unmount();
});
