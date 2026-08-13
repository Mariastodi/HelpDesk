import * as FileSystem from "expo-file-system";
import { DataTicketAttachment } from "@modules/help-desk/repository/ticket-type";

const ATTACHMENTS_DIRECTORY = `${FileSystem.documentDirectory}ticket-attachments/`;

async function ensureAttachmentsDirectory() {
  const directoryInfo = await FileSystem.getInfoAsync(ATTACHMENTS_DIRECTORY);
  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(ATTACHMENTS_DIRECTORY, { intermediates: true });
  }
}

function createStoredFileName(originalName: string): string {
  const normalizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${normalizedName}`;
}

export async function persistTicketAttachment(
  attachment: DataTicketAttachment,
): Promise<DataTicketAttachment> {
  if (!attachment.uri) {
    throw new Error("O arquivo selecionado não possui um endereço válido");
  }

  await ensureAttachmentsDirectory();
  if (attachment.uri.startsWith(ATTACHMENTS_DIRECTORY)) return attachment;

  const sourceInfo = await FileSystem.getInfoAsync(attachment.uri);
  if (!sourceInfo.exists) {
    throw new Error("O arquivo selecionado não está mais disponível no aparelho");
  }

  const storedUri = `${ATTACHMENTS_DIRECTORY}${createStoredFileName(attachment.name)}`;
  await FileSystem.copyAsync({ from: attachment.uri, to: storedUri });
  const storedInfo = await FileSystem.getInfoAsync(storedUri);
  if (!storedInfo.exists) {
    throw new Error("Não foi possível salvar o anexo no aplicativo");
  }

  return {
    ...attachment,
    uri: storedUri,
    size: attachment.size ?? (storedInfo.isDirectory ? undefined : storedInfo.size),
  };
}

export async function removeStoredTicketAttachment(attachmentUri: string): Promise<void> {
  if (!attachmentUri.startsWith(ATTACHMENTS_DIRECTORY)) return;
  const attachmentInfo = await FileSystem.getInfoAsync(attachmentUri);
  if (attachmentInfo.exists) {
    await FileSystem.deleteAsync(attachmentUri, { idempotent: true });
  }
}
