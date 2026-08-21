import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CalendarDays, Clock3, Paperclip } from "lucide-react-native";
import { colors } from "@core/theme/colors";
import { DeadlineIndicator, TicketStatus } from "@modules/help-desk/enums/ticket-status";
import { getDeadlineIndicator } from "@modules/help-desk/utils/get-deadline-indicator";
import { ITicketCardProps } from "./ticket-card-type";

const INDICATOR_COLOR: Record<DeadlineIndicator, string> = {
  [DeadlineIndicator.NEUTRAL]: "#3B82F6",
  [DeadlineIndicator.ON_TIME]: colors.status.prazoOk,
  [DeadlineIndicator.DUE_SOON]: colors.status.prazoProximo,
  [DeadlineIndicator.OVERDUE]: colors.status.prazoVencido,
};

const INDICATOR_LABEL: Record<DeadlineIndicator, string> = {
  [DeadlineIndicator.NEUTRAL]: "Dentro do prazo",
  [DeadlineIndicator.ON_TIME]: "Concluído / Encerrado",
  [DeadlineIndicator.DUE_SOON]: "Vence em breve",
  [DeadlineIndicator.OVERDUE]: "Prazo vencido",
};

const STATUS_COLOR: Record<TicketStatus, string> = {
  [TicketStatus.AGUARDANDO_ANALISE_CONTROLLER]: "#C35B00",
  [TicketStatus.AGUARDANDO_ATENDIMENTO]: "#C35B00",
  [TicketStatus.EM_ATENDIMENTO]: "#285DE5",
  [TicketStatus.AGUARDANDO_VALIDACAO_USUARIO]: "#079447",
  [TicketStatus.ENCERRADO]: "#3A4658",
  [TicketStatus.CANCELADO]: "#6B7280",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

export function TicketCard({ ticket, onPress }: ITicketCardProps) {
  const deadlineIndicator = getDeadlineIndicator(ticket.status, ticket.deadlineDate);
  const indicatorColor = INDICATOR_COLOR[deadlineIndicator];
  const statusColor = STATUS_COLOR[ticket.status];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress?.(ticket)}
    >
      <View style={[styles.stripe, { backgroundColor: statusColor }]} />

      <View style={styles.content}>
        <Text style={styles.ticketID}>{ticket.ticketID}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {ticket.description}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.metaRow}>
            <CalendarDays size={13} color={colors.text.secondary} />
            <Text style={styles.metaText}>{formatDate(ticket.openedAt)}</Text>
          </View>

          <View style={styles.metaRow}>
            <Clock3 size={13} color={indicatorColor} />
            <Text style={[styles.metaText, { color: indicatorColor }]}>
              {INDICATOR_LABEL[deadlineIndicator]}
            </Text>
          </View>

          {ticket.attachmentsCount > 0 ? (
            <View style={styles.metaRow}>
              <Paperclip size={12} color={colors.text.secondary} />
              <Text style={styles.metaText}>{ticket.attachmentsCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.background.screen,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  cardPressed: {
    opacity: 0.82,
  },
  stripe: {
    width: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 19,
    paddingVertical: 15,
  },
  ticketID: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.secondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 13,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    flexWrap: "wrap",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});
