import { TicketStatus } from "@modules/help-desk/enums/ticket-status";

export interface DataTicketAttachment {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export interface DataTicket {
  ticketID: string;
  description: string;
  openedAt: Date;
  deadlineDate: Date;
  status: TicketStatus;
  attachmentsCount: number;
  attachments: DataTicketAttachment[];
  attendantName?: string;
  isMine: boolean;
}

export interface DataTicketStatusSummary {
  inService: number;
  awaitingService: number;
  awaitingValidation: number;
  closed: number;
}

export interface DataHoursConsumption {
  consumedHours: number;
  contractedHours: number;
}
