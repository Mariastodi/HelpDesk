import { EnvironmentType } from "@core/enums/environment-type";
import { DataTicket } from "@modules/help-desk/repository/ticket-type";

export type DataTicketRoute = Omit<DataTicket, "openedAt" | "deadlineDate"> & {
  openedAt: Date | string;
  deadlineDate: Date | string;
};

export type RootStackParamList = {
  EnvironmentSelection: undefined;
  Login: { environment: EnvironmentType };
  TicketList: undefined;
  NewTicket: undefined;
  TicketDetail: { ticket: DataTicketRoute };
  Settings: undefined;
};
