import { AxiosInstance } from "axios";
import { ApiHttpErrorCode, BusinessErrorCode } from "@core/enums/api-error-code";
import { AppApiError } from "@core/services/api/app-api-error";
import { localStorage, STORAGE_KEYS } from "@core/services/storage/local-storage";
import { TicketStatus } from "@modules/help-desk/enums/ticket-status";
import { DataHoursConsumption, DataTicket, DataTicketStatusSummary } from "./ticket-type";
import { appConfig } from "@core/config/app-config";

let mockTickets: DataTicket[] = [];

export async function getTickets(apiClient: AxiosInstance): Promise<DataTicket[]> {
  if (appConfig.isMockApiEnabled) {
    return mockGetTickets();
  }

  const { data: responsePayload } = await apiClient.get<DataTicket[]>("/help-desk/tickets");
  return responsePayload;
}

export async function createTicket(
  apiClient: AxiosInstance,
  ticketCreatePayload: {
    description: string;
    attachmentFiles: { uri: string; name: string; mimeType: string }[];
  },
): Promise<DataTicket> {
  if (appConfig.isMockApiEnabled) {
    return mockCreateTicket(ticketCreatePayload);
  }

  const requestData = new FormData();
  requestData.append("descricao", ticketCreatePayload.description);
  ticketCreatePayload.attachmentFiles.forEach((attachment) => {
    requestData.append("anexos", {
      uri: attachment.uri,
      name: attachment.name,
      type: attachment.mimeType,
    } as unknown as Blob);
  });

  const { data: responsePayload } = await apiClient.post<DataTicket>(
    "/help-desk/tickets",
    requestData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return responsePayload;
}

export async function getHoursConsumption(apiClient: AxiosInstance): Promise<DataHoursConsumption> {
  if (appConfig.isMockApiEnabled) {
    await wait(appConfig.simulatedRequestDelayInMilliseconds);
    return { consumedHours: 14, contractedHours: 20 };
  }

  const { data: responsePayload } = await apiClient.get<DataHoursConsumption>(
    "/help-desk/hours-consumption",
  );
  return responsePayload;
}

export function getTicketStatusSummary(tickets: DataTicket[]): DataTicketStatusSummary {
  return {
    awaitingService: tickets.filter((t) => t.status === TicketStatus.EM_ATENDIMENTO).length,
    lateOrDueSoon: tickets.filter(
      (ticket) =>
        ticket.status === TicketStatus.AGUARDANDO_ATENDIMENTO ||
        ticket.status === TicketStatus.AGUARDANDO_ANALISE_CONTROLLER,
    ).length,
    awaitingValidation: tickets.filter(
      (t) => t.status === TicketStatus.AGUARDANDO_VALIDACAO_USUARIO,
    ).length,
    closed: tickets.filter((t) => t.status === TicketStatus.ENCERRADO).length,
  };
}

async function mockGetTickets(): Promise<DataTicket[]> {
  await wait(appConfig.simulatedRequestDelayInMilliseconds);

  if (mockTickets.length === 0) {
    const storedTickets = await localStorage.get<DataTicket[]>(STORAGE_KEYS.MOCK_TICKETS);
    if (storedTickets?.length) {
      mockTickets = storedTickets.map(normalizeTicket);
    }
  }

  if (mockTickets.length === 0) {
    const now = Date.now();
    const hour = 1000 * 60 * 60;

    mockTickets = [
      {
        ticketID: "GPM-1042",
        description: "Impressora do 3º andar não imprime após atualização de driver",
        openedAt: new Date(now - 3 * 24 * hour),
        deadlineDate: new Date(now + 6 * hour),
        status: TicketStatus.AGUARDANDO_ATENDIMENTO,
        attachmentsCount: 0,
        attachments: [],
        isMine: true,
      },
      {
        ticketID: "GPM-1041",
        description: "Aguardando validação de acesso no sistema financeiro",
        openedAt: new Date(now - 4 * 24 * hour),
        deadlineDate: new Date(now + 2 * 24 * hour),
        status: TicketStatus.AGUARDANDO_VALIDACAO_USUARIO,
        attachmentsCount: 0,
        attachments: [],
        attendantName: "Carlos",
        isMine: true,
      },
      {
        ticketID: "GPM-1039",
        description: "Solicitação de substituição de notebook por lentidão excessiva",
        openedAt: new Date(now - 5 * 24 * hour),
        deadlineDate: new Date(now - 2 * hour),
        status: TicketStatus.EM_ATENDIMENTO,
        attachmentsCount: 0,
        attachments: [],
        attendantName: "Carlos",
        isMine: false,
      },
      {
        ticketID: "GPM-1038",
        description: "Chamado concluído após troca de suprimentos na impressora",
        openedAt: new Date(now - 6 * 24 * hour),
        deadlineDate: new Date(now - 1 * 24 * hour),
        status: TicketStatus.ENCERRADO,
        attachmentsCount: 0,
        attachments: [],
        attendantName: "Carlos",
        isMine: true,
      },
    ];
    await localStorage.set(STORAGE_KEYS.MOCK_TICKETS, mockTickets);
  }

  return mockTickets.map(normalizeTicket);
}

async function mockCreateTicket(ticketCreatePayload: {
  description: string;
  attachmentFiles: { uri: string; name: string; mimeType: string }[];
}): Promise<DataTicket> {
  await wait(appConfig.simulatedTicketCreationDelayInMilliseconds);

  if (!ticketCreatePayload.description?.trim()) {
    throw new AppApiError({ httpCode: ApiHttpErrorCode.VALIDATION_422 });
  }

  const shouldSimulateHoursPackageExceeded = false;
  if (shouldSimulateHoursPackageExceeded) {
    throw new AppApiError({
      httpCode: ApiHttpErrorCode.VALIDATION_422,
      businessCode: BusinessErrorCode.HOURS_PACKAGE_EXCEEDED,
    });
  }

  const newTicket: DataTicket = {
    ticketID: createUniqueTicketId(),
    description: ticketCreatePayload.description.trim(),
    openedAt: new Date(),
    deadlineDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
    status: TicketStatus.AGUARDANDO_ANALISE_CONTROLLER,
    attachmentsCount: ticketCreatePayload.attachmentFiles.length,
    attachments: ticketCreatePayload.attachmentFiles,
    isMine: true,
  };

  mockTickets = [newTicket, ...mockTickets];
  await localStorage.set(STORAGE_KEYS.MOCK_TICKETS, mockTickets);
  return { ...newTicket };
}

function normalizeTicket(ticket: DataTicket): DataTicket {
  const attachments = ticket.attachments ?? [];
  return {
    ...ticket,
    openedAt: new Date(ticket.openedAt),
    deadlineDate: new Date(ticket.deadlineDate),
    attachments,
    attachmentsCount: attachments.length,
  };
}

function createUniqueTicketId(): string {
  const existingTicketIds = new Set(mockTickets.map((ticket) => ticket.ticketID));
  let ticketId = "";

  do {
    ticketId = `GPM-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (existingTicketIds.has(ticketId));

  return ticketId;
}

function wait(durationInMilliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationInMilliseconds));
}
