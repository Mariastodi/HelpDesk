import { AxiosInstance } from "axios";
import { ApiHttpErrorCode, BusinessErrorCode } from "@core/enums/api-error-code";
import { AppApiError } from "@core/services/api/app-api-error";
import { getMockTicketsStorageKey, localStorage } from "@core/services/storage/local-storage";
import { TicketStatus } from "@modules/help-desk/enums/ticket-status";
import { DataHoursConsumption, DataTicket, DataTicketStatusSummary } from "./ticket-type";
import { appConfig } from "@core/config/app-config";

const mockTicketsByInstitution = new Map<number, DataTicket[]>();

export async function getTickets(
  apiClient: AxiosInstance,
  institutionId: number,
): Promise<DataTicket[]> {
  if (appConfig.isMockApiEnabled) {
    return mockGetTickets(institutionId);
  }

  const { data: responsePayload } = await apiClient.get<DataTicket[]>("/help-desk/tickets", {
    params: { institutionId },
  });
  return responsePayload.map(normalizeTicket);
}

export async function createTicket(
  apiClient: AxiosInstance,
  ticketCreatePayload: {
    institutionId: number;
    description: string;
    attachmentFiles: { uri: string; name: string; mimeType: string }[];
  },
): Promise<DataTicket> {
  if (appConfig.isMockApiEnabled) {
    return mockCreateTicket(ticketCreatePayload);
  }

  const requestData = new FormData();
  requestData.append("institutionId", String(ticketCreatePayload.institutionId));
  requestData.append("descricao", ticketCreatePayload.description);
  ticketCreatePayload.attachmentFiles.forEach((attachment) => {
    requestData.append("attachments", {
      uri: attachment.uri,
      name: attachment.name,
      type: attachment.mimeType,
    } as unknown as Blob);
  });

  const { data: responsePayload } = await apiClient.post<DataTicket>(
    "/help-desk/tickets",
    requestData,
  );

  return normalizeTicket(responsePayload);
}

export async function getHoursConsumption(
  apiClient: AxiosInstance,
  institutionId: number,
): Promise<DataHoursConsumption> {
  if (appConfig.isMockApiEnabled) {
    await wait(appConfig.simulatedRequestDelayInMilliseconds);
    return institutionId === 101
      ? { consumedHours: 18, contractedHours: 20 }
      : { consumedHours: 6, contractedHours: 16 };
  }

  const { data: responsePayload } = await apiClient.get<DataHoursConsumption>(
    "/help-desk/hours-consumption",
    { params: { institutionId } },
  );
  return responsePayload;
}

export function getTicketStatusSummary(tickets: DataTicket[]): DataTicketStatusSummary {
  return {
    inService: tickets.filter((ticket) => ticket.status === TicketStatus.EM_ATENDIMENTO).length,
    awaitingService: tickets.filter(
      (ticket) => ticket.status === TicketStatus.AGUARDANDO_ATENDIMENTO,
    ).length,
    awaitingValidation: tickets.filter(
      (t) => t.status === TicketStatus.AGUARDANDO_VALIDACAO_USUARIO,
    ).length,
    closed: tickets.filter((t) => t.status === TicketStatus.ENCERRADO).length,
  };
}

async function mockGetTickets(institutionId: number): Promise<DataTicket[]> {
  await wait(appConfig.simulatedRequestDelayInMilliseconds);
  let mockTickets = mockTicketsByInstitution.get(institutionId) ?? [];

  if (mockTickets.length === 0) {
    const storedTickets = await localStorage.get<DataTicket[]>(
      getMockTicketsStorageKey(institutionId),
    );
    if (storedTickets?.length) {
      mockTickets = storedTickets.map(normalizeTicket);
    }
  }

  if (mockTickets.length === 0) {
    const now = Date.now();
    const hour = 1000 * 60 * 60;

    mockTickets = [
      {
        ticketID: "GPM-1050",
        description: "Análise inicial de integração com o ERP",
        openedAt: new Date(now - 1 * 24 * hour),
        deadlineDate: new Date(now + 36 * hour),
        status: TicketStatus.AGUARDANDO_ANALISE_CONTROLLER,
        attachmentsCount: 0,
        attachments: [],
        isMine: true,
      },
      {
        ticketID: "GPM-1049",
        description: "Impressora do 3º andar não imprime após atualização de driver",
        openedAt: new Date(now - 2 * 24 * hour),
        deadlineDate: new Date(now + 6 * hour),
        status: TicketStatus.AGUARDANDO_ATENDIMENTO,
        attachmentsCount: 0,
        attachments: [],
        isMine: true,
      },
      {
        ticketID: "GPM-1048",
        description: "Aguardando validação de acesso no sistema financeiro",
        openedAt: new Date(now - 3 * 24 * hour),
        deadlineDate: new Date(now + 2 * 24 * hour),
        status: TicketStatus.AGUARDANDO_VALIDACAO_USUARIO,
        attachmentsCount: 0,
        attachments: [],
        attendantName: "Carlos",
        isMine: true,
      },
      {
        ticketID: "GPM-1047",
        description: "Solicitação de substituição de notebook por lentidão excessiva",
        openedAt: new Date(now - 4 * 24 * hour),
        deadlineDate: new Date(now - 2 * hour),
        status: TicketStatus.EM_ATENDIMENTO,
        attachmentsCount: 0,
        attachments: [],
        attendantName: "Carlos",
        isMine: false,
      },
      {
        ticketID: "GPM-1046",
        description: "Chamado concluído após troca de suprimentos na impressora",
        openedAt: new Date(now - 5 * 24 * hour),
        deadlineDate: new Date(now - 1 * 24 * hour),
        status: TicketStatus.ENCERRADO,
        attachmentsCount: 0,
        attachments: [],
        attendantName: "Carlos",
        isMine: true,
      },
      {
        ticketID: "GPM-1045",
        description: "Solicitação cancelada de criação de usuário temporário",
        openedAt: new Date(now - 6 * 24 * hour),
        deadlineDate: new Date(now + 4 * 24 * hour),
        status: TicketStatus.CANCELADO,
        attachmentsCount: 0,
        attachments: [],
        isMine: false,
      },
      {
        ticketID: "GPM-1044",
        description: "Erro crítico no módulo de emissão de notas fiscais",
        openedAt: new Date(now - 12 * 24 * hour),
        deadlineDate: new Date(now - 8 * 24 * hour),
        status: TicketStatus.EM_ATENDIMENTO,
        attachmentsCount: 1,
        attachments: [
          {
            uri: "https://example.invalid/erro-nota-fiscal.png",
            name: "erro-nota-fiscal.png",
            mimeType: "image/png",
          },
        ],
        attendantName: "Fernanda",
        isMine: true,
      },
      {
        ticketID: "GPM-1043",
        description: "Configuração de acesso à rede Wi-Fi da filial",
        openedAt: new Date(now - 30 * 24 * hour),
        deadlineDate: new Date(now - 25 * 24 * hour),
        status: TicketStatus.ENCERRADO,
        attachmentsCount: 0,
        attachments: [],
        attendantName: "Rafael",
        isMine: false,
      },
    ];
    await localStorage.set(getMockTicketsStorageKey(institutionId), mockTickets);
  }

  mockTicketsByInstitution.set(institutionId, mockTickets);
  return mockTickets.map(normalizeTicket);
}

async function mockCreateTicket(ticketCreatePayload: {
  institutionId: number;
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

  const mockTickets = mockTicketsByInstitution.get(ticketCreatePayload.institutionId) ?? [];
  const updatedTickets = [newTicket, ...mockTickets];
  mockTicketsByInstitution.set(ticketCreatePayload.institutionId, updatedTickets);
  await localStorage.set(
    getMockTicketsStorageKey(ticketCreatePayload.institutionId),
    updatedTickets,
  );
  return { ...newTicket };
}

function normalizeTicketStatus(status: TicketStatus | string): TicketStatus {
  const normalizedStatus = String(status)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const statusAliases: Record<string, TicketStatus> = {
    AGUARDANDO_ANALISE: TicketStatus.AGUARDANDO_ANALISE_CONTROLLER,
    AGUARDANDO_ANALISE_CONTROLLER: TicketStatus.AGUARDANDO_ANALISE_CONTROLLER,
    AGUARDANDO_ATENDIMENTO: TicketStatus.AGUARDANDO_ATENDIMENTO,
    ATENDIMENTO: TicketStatus.EM_ATENDIMENTO,
    EM_ATENDIMENTO: TicketStatus.EM_ATENDIMENTO,
    AGUARDANDO_VALIDACAO: TicketStatus.AGUARDANDO_VALIDACAO_USUARIO,
    AGUARDANDO_VALIDACAO_USUARIO: TicketStatus.AGUARDANDO_VALIDACAO_USUARIO,
    VALIDACAO: TicketStatus.AGUARDANDO_VALIDACAO_USUARIO,
    CANCELADO: TicketStatus.CANCELADO,
    ENCERRADO: TicketStatus.ENCERRADO,
  };

  return statusAliases[normalizedStatus] ?? TicketStatus.AGUARDANDO_ANALISE_CONTROLLER;
}

function normalizeTicket(ticket: DataTicket): DataTicket {
  const attachments = ticket.attachments ?? [];
  const normalizedAttachments = attachments
    .filter((attachment) => Boolean(attachment?.uri))
    .map((attachment) => ({
      ...attachment,
      name: attachment.name || "Anexo",
      mimeType: attachment.mimeType || "application/octet-stream",
    }));

  return {
    ...ticket,
    ticketID: String(ticket.ticketID ?? "Chamado sem identificação"),
    description: String(ticket.description ?? "Descrição não informada"),
    openedAt: new Date(ticket.openedAt),
    deadlineDate: new Date(ticket.deadlineDate),
    status: normalizeTicketStatus(ticket.status),
    attachments: normalizedAttachments,
    attachmentsCount: normalizedAttachments.length,
  };
}

function createUniqueTicketId(): string {
  const existingTicketIds = new Set(
    Array.from(mockTicketsByInstitution.values()).flatMap((tickets) =>
      tickets.map((ticket) => ticket.ticketID),
    ),
  );
  let ticketId = "";

  do {
    ticketId = `GPM-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (existingTicketIds.has(ticketId));

  return ticketId;
}

function wait(durationInMilliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationInMilliseconds));
}
