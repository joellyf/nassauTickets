import { beforeEach, describe, expect, it } from "vitest";
import { MockTicketService } from "./ticketService";
import type { TicketType } from "../types/ticket";
let service: MockTicketService;
let now: Date;
beforeEach(() => {
  now = new Date(2026, 9, 3, 10);
  service = new MockTicketService(() => now, 0);
});
async function finishNext() {
  const next = await service.callNext(1);
  await service.act(next.id, "start");
  await service.act(next.id, "finish");
  return next;
}
describe("serviço demonstrativo de senhas", () => {
  it("numera por tipo e reinicia a sequência no próximo dia", async () => {
    expect((await service.issue("SP")).id).toBe("261003-SP001");
    expect((await service.issue("SG")).id).toBe("261003-SG001");
    expect((await service.issue("SP")).id).toBe("261003-SP002");
    now = new Date(2026, 9, 4, 10);
    expect((await service.issue("SP")).id).toBe("261004-SP001");
  });
  it("alterna SP com SE/SG, preservando FIFO dentro de cada tipo", async () => {
    for (const type of ["SG", "SP", "SE", "SP", "SE"] as TicketType[])
      await service.issue(type);
    const order = [];
    for (let i = 0; i < 5; i++) order.push((await finishNext()).id);
    expect(order).toEqual([
      "261003-SP001",
      "261003-SE001",
      "261003-SP002",
      "261003-SE002",
      "261003-SG001",
    ]);
  });
  it("atende a fila disponível quando não existe a prioridade alternada", async () => {
    await service.issue("SP");
    await service.issue("SP");
    expect((await finishNext()).type).toBe("SP");
    expect((await finishNext()).type).toBe("SP");
    await service.issue("SG");
    expect((await finishNext()).type).toBe("SG");
  });
  it("não permite iniciar ou finalizar antes da chamada", async () => {
    const ticket = await service.issue("SG");
    await expect(service.act(ticket.id, "start")).rejects.toThrow(
      "não é permitida",
    );
    await expect(service.act(ticket.id, "finish")).rejects.toThrow(
      "não é permitida",
    );
    await service.callNext(1);
    await expect(service.act(ticket.id, "finish")).rejects.toThrow(
      "não é permitida",
    );
    await service.act(ticket.id, "start");
    expect((await service.act(ticket.id, "finish")).status).toBe("ATENDIDA");
    await expect(service.act(ticket.id, "finish")).rejects.toThrow(
      "não é permitida",
    );
  });
  it("só registra ausência após duas chamadas, sem campos de atendimento", async () => {
    const ticket = await service.issue("SE");
    await service.callNext(1);
    await expect(service.act(ticket.id, "absent")).rejects.toThrow();
    await service.act(ticket.id, "recall");
    await expect(service.act(ticket.id, "recall")).rejects.toThrow();
    const absent = await service.act(ticket.id, "absent");
    expect(absent.status).toBe("NÃO_COMPARECEU");
    expect(absent.firstCallAt).toBeDefined();
    expect(absent.secondCallAt).toBeDefined();
    expect(absent.startedAt).toBeUndefined();
    expect(absent.finishedAt).toBeUndefined();
  });
  it("permite atendimento na segunda chamada e registra horários", async () => {
    const ticket = await service.issue("SG");
    await service.callNext(2);
    await service.act(ticket.id, "recall");
    now = new Date(2026, 9, 3, 10, 2);
    await service.act(ticket.id, "start");
    now = new Date(2026, 9, 3, 10, 5);
    const done = await service.act(ticket.id, "finish");
    expect(done.counter).toBe(2);
    expect(done.startedAt).not.toBe(done.finishedAt);
  });
  it("não duplica a senha entre comandos concorrentes dentro deste mock", async () => {
    await service.issue("SG");
    await service.issue("SG");
    const [one, two] = await Promise.all([
      service.callNext(1),
      service.callNext(2),
    ]);
    expect(one.id).not.toBe(two.id);
    await expect(service.callNext(1)).rejects.toThrow("Conclua");
  });
  it("bloqueia duas chamadas simultâneas para o mesmo guichê", async () => {
    await service.issue("SG");
    await service.issue("SG");
    const results = await Promise.allSettled([
      service.callNext(1),
      service.callNext(1),
    ]);
    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      service
        .getSnapshot()
        .tickets.filter((ticket) => ticket.status === "AGUARDANDO"),
    ).toHaveLength(1);
  });
  it("mantém só cinco chamadas efetivadas, contando a segunda chamada", async () => {
    await service.issue("SP");
    expect(service.getSnapshot().calls).toHaveLength(0);
    await service.callNext(1);
    await service.act("261003-SP001", "recall");
    expect(service.getSnapshot().calls[0].recall).toBe(true);
    await service.act("261003-SP001", "absent");
    for (let i = 0; i < 5; i++) {
      await service.issue("SG");
      await finishNext();
    }
    expect(service.getSnapshot().calls).toHaveLength(5);
    expect(service.getSnapshot().calls[0].ticketId).toBe("261003-SG005");
  });
  it("em falha, preserva estado e permite retomar após reconexão", async () => {
    await service.issue("SP");
    service.setAvailable(false);
    await expect(service.issue("SG")).rejects.toThrow("indisponível");
    await expect(service.callNext(1)).rejects.toThrow("indisponível");
    expect(service.getSnapshot().tickets).toHaveLength(1);
    expect(service.getSnapshot().calls).toHaveLength(0);
    service.setAvailable(true);
    expect((await service.callNext(1)).type).toBe("SP");
  });
  it("encerra fila e chamadas não iniciadas, mas deixa concluir o atendimento", async () => {
    const one = await service.issue("SG");
    await service.callNext(1);
    await service.act(one.id, "start");
    await service.issue("SG");
    await service.callNext(2);
    await service.issue("SP");
    service.setOpen(false);
    expect(
      service
        .getSnapshot()
        .tickets.filter((ticket) => ticket.status === "DESCARTADA"),
    ).toHaveLength(2);
    await expect(service.issue("SG")).rejects.toThrow("encerrado");
    await expect(service.callNext(3)).rejects.toThrow("encerrado");
    expect((await service.act(one.id, "finish")).status).toBe("ATENDIDA");
  });
  it("recusa fila vazia e guichê inexistente", async () => {
    await expect(service.callNext(1)).rejects.toThrow("Nenhuma senha");
    await expect(service.callNext(4)).rejects.toThrow("inválido");
  });
});
