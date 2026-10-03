import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test } from "vitest";
import App from "./App";
test("emite uma vez, chama, exibe no painel e conclui o atendimento", async () => {
  render(<App />);
  const issue = screen.getByRole("button", {
    name: /SP Atendimento prioritário/,
  });
  fireEvent.click(issue);
  fireEvent.click(issue);
  await screen.findByText("Pronto. Agora é só aguardar.");
  const number = screen.getByText(/^[0-9]{6}-SP001$/).textContent!;
  fireEvent.click(screen.getByRole("link", { name: "Painel" }));
  expect(screen.queryByText(number)).toBeNull();
  fireEvent.click(
    screen.getByRole("link", { name: "Atendimento" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Chamar próxima senha" }));
  await screen.findByRole("button", { name: "Iniciar atendimento" });
  fireEvent.click(screen.getByRole("button", { name: "Chamar novamente" }));
  await screen.findByRole("button", { name: "Cliente não compareceu" });
  fireEvent.click(screen.getByRole("link", { name: "Painel" }));
  expect(screen.getAllByText(number)).toHaveLength(3);
  expect(screen.getAllByText("Última chamada")).toHaveLength(2);
  fireEvent.click(
    screen.getByRole("link", { name: "Atendimento" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Iniciar atendimento" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Finalizar atendimento" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Chamar próxima senha" }),
    ).toBeDisabled(),
  );
  expect(screen.getByText(`${number}: Atendida.`)).toBeDefined();
});
