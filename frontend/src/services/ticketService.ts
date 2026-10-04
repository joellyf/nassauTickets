import type { Snapshot, Ticket, TicketAction, TicketType } from "../types/ticket";

export interface TicketService {
  getSnapshot: () => Snapshot;
  subscribe: (listener: () => void) => () => void;
  issue: (type: TicketType) => Promise<Ticket>;
  callNext: (counter: number) => Promise<Ticket>;
  act: (id: string, action: TicketAction) => Promise<Ticket>;
}

export class MockTicketService implements TicketService {
  private state: Snapshot = {
    tickets: [],
    calls: [],
    available: true,
    open: true,
  };
  private listeners = new Set<() => void>();
  private lastWasPriority = false;
  private eventId = 0;

  constructor(
    private now: () => Date = () => new Date(),
    private latency = 180,
  ) {}

  getSnapshot = () => this.state;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private publish(patch: Partial<Snapshot>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  private async ready() {
    await new Promise((resolve) => setTimeout(resolve, this.latency));
    if (!this.state.available)
      throw new Error(
        "Serviço indisponível. Nenhuma operação foi realizada. Restaure a conexão simulada e tente novamente.",
      );
  }

  setAvailable(available: boolean) {
    this.publish({ available });
  }

  setOpen(open: boolean) {
    const tickets = open
      ? this.state.tickets
      : this.state.tickets.map((ticket) =>
          ["AGUARDANDO", "CHAMADA", "CHAMADA_NOVAMENTE"].includes(ticket.status)
            ? { ...ticket, status: "DESCARTADA" as const }
            : ticket,
        );
    this.publish({ open, tickets });
  }

  async issue(type: TicketType) {
    await this.ready();
    if (!this.state.open)
      throw new Error(
        "Expediente encerrado. A emissão está disponível das 7h às 17h.",
      );

    const now = this.now();
    const day = [
      String(now.getFullYear()).slice(-2),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("");
    const prefix = `${day}-${type}`;
    const sequence =
      this.state.tickets.filter((ticket) => ticket.id.startsWith(prefix))
        .length + 1;

    if (sequence > 999)
      throw new Error(
        "Limite diário da sequência atingido. Procure a recepção.",
      );

    const ticket: Ticket = {
      id: `${prefix}${String(sequence).padStart(3, "0")}`,
      type,
      status: "AGUARDANDO",
      issuedAt: now.toISOString(),
    };

    this.publish({ tickets: [...this.state.tickets, ticket] });
    return ticket;
  }

  async callNext(counter: number) {
    await this.ready();
    if (!this.state.open)
      throw new Error(
        "Expediente encerrado. Conclua apenas os atendimentos já iniciados.",
      );

    if (![1, 2, 3].includes(counter)) throw new Error("Guichê inválido.");

    if (
      this.state.tickets.some(
        (ticket) =>
          ticket.counter === counter &&
          ["CHAMADA", "CHAMADA_NOVAMENTE", "EM_ATENDIMENTO"].includes(
            ticket.status,
          ),
      )
    )
      throw new Error("Conclua a senha atual antes de chamar a próxima.");

    const waiting = this.state.tickets.filter(
      (ticket) => ticket.status === "AGUARDANDO",
    );

    const priority = waiting.find((ticket) => ticket.type === "SP");
    const regular =
      waiting.find((ticket) => ticket.type === "SE") ??
      waiting.find((ticket) => ticket.type === "SG");

    const next = this.lastWasPriority
      ? (regular ?? priority)
      : (priority ?? regular);

    if (!next) throw new Error("Nenhuma senha aguardando.");

    this.lastWasPriority = next.type === "SP";
    const at = this.now().toISOString();
    const updated = {
      ...next,
      counter,
      status: "CHAMADA" as const,
      firstCallAt: at,
    };

    this.publish({
      tickets: this.state.tickets.map((ticket) =>
        ticket.id === next.id ? updated : ticket,
      ),
      calls: [
        {
          id: ++this.eventId,
          ticketId: next.id,
          type: next.type,
          counter,
          at,
          recall: false,
        },
        ...this.state.calls,
      ].slice(0, 5),
    });

    return updated;
  }

  async act(id: string, action: TicketAction) {
    await this.ready();
    const ticket = this.state.tickets.find((item) => item.id === id);
    if (!ticket) throw new Error("Senha não encontrada.");

    const at = this.now().toISOString();
    let patch: Partial<Ticket>;

    if (action === "recall" && ticket.status === "CHAMADA")
      patch = { status: "CHAMADA_NOVAMENTE", secondCallAt: at };
    else if (
      action === "start" &&
      ["CHAMADA", "CHAMADA_NOVAMENTE"].includes(ticket.status)
    )
      patch = { status: "EM_ATENDIMENTO", startedAt: at };
    else if (action === "finish" && ticket.status === "EM_ATENDIMENTO")
      patch = { status: "ATENDIDA", finishedAt: at };
    else if (action === "absent" && ticket.status === "CHAMADA_NOVAMENTE")
      patch = { status: "NÃO_COMPARECEU" };
    else
      throw new Error("Esta ação não é permitida no estado atual da senha.");

    const updated = { ...ticket, ...patch };

    this.publish({
      tickets: this.state.tickets.map((item) =>
        item.id === id ? updated : item,
      ),
      calls:
        action === "recall"
          ? [
              {
                id: ++this.eventId,
                ticketId: id,
                type: ticket.type,
                counter: ticket.counter!,
                at,
                recall: true,
              },
              ...this.state.calls,
            ].slice(0, 5)
          : this.state.calls,
    });

    return updated;
  }
}

class ApiTicketService implements TicketService {
  private state: Snapshot = {
    tickets: [],
    calls: [],
    available: true,
    open: true,
  };
  private listeners = new Set<() => void>();
  private poller?: number;

  constructor(
    private readonly baseUrl = "http://localhost:3001/api/tickets",
    private readonly pollMs = 2000,
  ) {
    void this.refresh();
    if (typeof window !== "undefined") {
      this.poller = window.setInterval(() => {
        void this.refresh();
      }, this.pollMs);
    }
  }

  getSnapshot = () => this.state;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit(next: Snapshot) {
    this.state = next;
    this.listeners.forEach((listener) => listener());
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error ?? payload?.message ?? "Operação indisponível.");
    }
    return payload as T;
  }

  private async refresh() {
    try {
      const snapshot = await this.request<Snapshot>("/snapshot");
      this.emit({
        tickets: snapshot.tickets ?? [],
        calls: snapshot.calls ?? [],
        available: snapshot.available ?? true,
        open: snapshot.open ?? true,
      });
    } catch {
      this.emit({
        tickets: this.state.tickets,
        calls: this.state.calls,
        available: false,
        open: false,
      });
    }
  }

  async issue(type: TicketType) {
    const ticket = await this.request<Ticket>("/emissao", {
      method: "POST",
      body: JSON.stringify({ tipo: type }),
    });
    await this.refresh();
    return ticket;
  }

  async callNext(counter: number) {
    const ticket = await this.request<Ticket>("/chamar-proximo", {
      method: "POST",
      body: JSON.stringify({ guiche_id: counter, atendente_id: 1 }),
    });
    await this.refresh();
    return ticket;
  }

  async act(id: string, action: TicketAction) {
    const match = this.state.tickets.find((ticket) => ticket.id === id);
    const databaseId = match?.databaseId ?? Number(id);

    if (!Number.isFinite(databaseId) || databaseId <= 0) {
      throw new Error("Senha não encontrada.");
    }

    const ticket = await this.request<Ticket>(`/${databaseId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ acao: action, atendente_id: 1 }),
    });
    await this.refresh();
    return ticket;
  }
}

export const ticketService = new ApiTicketService();