import { DataTicket } from "@modules/help-desk/repository/ticket-type";

export interface ITicketCardProps {
  ticket: DataTicket;
  onPress?: (ticket: DataTicket) => void;
}
