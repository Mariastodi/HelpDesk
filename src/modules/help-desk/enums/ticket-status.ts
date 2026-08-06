export enum TicketStatus {
  AGUARDANDO_ANALISE_CONTROLLER = "AGUARDANDO_ANALISE_CONTROLLER",
  AGUARDANDO_ATENDIMENTO = "AGUARDANDO_ATENDIMENTO",
  EM_ATENDIMENTO = "EM_ATENDIMENTO",
  AGUARDANDO_VALIDACAO_USUARIO = "AGUARDANDO_VALIDACAO_USUARIO",
  CANCELADO = "CANCELADO",
  ENCERRADO = "ENCERRADO",
}

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  [TicketStatus.AGUARDANDO_ANALISE_CONTROLLER]: "Aguardando Análise Controller",
  [TicketStatus.AGUARDANDO_ATENDIMENTO]: "Aguardando Atendimento",
  [TicketStatus.EM_ATENDIMENTO]: "Em Atendimento",
  [TicketStatus.AGUARDANDO_VALIDACAO_USUARIO]: "Aguardando Validação Usuário",
  [TicketStatus.CANCELADO]: "Cancelado",
  [TicketStatus.ENCERRADO]: "Encerrado",
};

export enum DeadlineIndicator {
  NEUTRAL = "NEUTRAL",
  ON_TIME = "ON_TIME",
  DUE_SOON = "DUE_SOON",
  OVERDUE = "OVERDUE",
}
