export type TicketType = "SP" | "SG" | "SE";
export type TicketStatus =
  | "AGUARDANDO"
  | "CHAMADA"
  | "CHAMADA_NOVAMENTE"
  | "EM_ATENDIMENTO"
  | "ATENDIDA"
  | "NÃO_COMPARECEU"
  | "DESCARTADA";
export interface Ticket {
  id: string;
  type: TicketType;
  status: TicketStatus;
  issuedAt: string;
  counter?: number;
  firstCallAt?: string;
  secondCallAt?: string;
  startedAt?: string;
  finishedAt?: string;
}
export interface Call {
  id: number;
  ticketId: string;
  type: TicketType;
  counter: number;
  at: string;
  recall: boolean;
}
export interface Snapshot {
  tickets: Ticket[];
  calls: Call[];
  available: boolean;
  open: boolean;
}
export type TicketAction = "recall" | "start" | "finish" | "absent";
export const ticketTypes: Record<
  TicketType,
  { title: string; description: string }
> = {
  SP: {
    title: "Atendimento prioritário",
    description: "Para quem tem direito a atendimento preferencial.",
  },
  SG: {
    title: "Atendimento geral",
    description: "Recepção, orientações e realização de exames.",
  },
  SE: {
    title: "Retirada de exames",
    description: "Para retirar os resultados dos seus exames.",
  },
};
export const statusLabels: Record<TicketStatus, string> = {
  AGUARDANDO: "Aguardando",
  CHAMADA: "Chamada",
  CHAMADA_NOVAMENTE: "Última chamada",
  EM_ATENDIMENTO: "Em atendimento",
  ATENDIDA: "Atendida",
  NÃO_COMPARECEU: "Não compareceu",
  DESCARTADA: "Descartada",
};
