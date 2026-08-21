import { DataTicketStatusSummary } from "@modules/help-desk/repository/ticket-type";
import { TicketStatus } from "@modules/help-desk/enums/ticket-status";

export type MainTicketStatus =
  | TicketStatus.EM_ATENDIMENTO
  | TicketStatus.AGUARDANDO_ATENDIMENTO
  | TicketStatus.AGUARDANDO_VALIDACAO_USUARIO
  | TicketStatus.ENCERRADO;

export interface IStatusTabsProps {
  summary: DataTicketStatusSummary;
  activeStatus?: MainTicketStatus;
  onStatusPress: (status: MainTicketStatus) => void;
}
