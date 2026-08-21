import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@core/theme/colors";
import { TicketStatus } from "@modules/help-desk/enums/ticket-status";
import { IStatusTabsProps, MainTicketStatus } from "./status-tabs-type";

export function StatusTabs({ summary, activeStatus, onStatusPress }: IStatusTabsProps) {
  const badges: {
    status: MainTicketStatus;
    count: number;
    label: string;
    color: string;
    backgroundColor: string;
    borderColor: string;
  }[] = [
    {
      status: TicketStatus.EM_ATENDIMENTO,
      count: summary.inService,
      label: "ATENDIMENTO",
      color: "#285DE5",
      backgroundColor: "#EDF4FF",
      borderColor: "#D5E3FA",
    },
    {
      status: TicketStatus.AGUARDANDO_ATENDIMENTO,
      count: summary.awaitingService,
      label: "AGUARDANDO",
      color: "#C35B00",
      backgroundColor: "#FFF9EA",
      borderColor: "#F6E4B4",
    },
    {
      status: TicketStatus.AGUARDANDO_VALIDACAO_USUARIO,
      count: summary.awaitingValidation,
      label: "VALIDAÇÃO",
      color: "#079447",
      backgroundColor: "#EAF9F0",
      borderColor: "#D1EFDC",
    },
    {
      status: TicketStatus.ENCERRADO,
      count: summary.closed,
      label: "ENCERRADO",
      color: "#3A4658",
      backgroundColor: colors.background.screen,
      borderColor: "#E9EEF3",
    },
  ];

  return (
    <View style={styles.row}>
      {badges.map((badge) => (
        <Pressable
          key={badge.label}
          accessibilityRole="button"
          accessibilityState={{ selected: activeStatus === badge.status }}
          accessibilityLabel={`Filtrar por ${badge.label.toLowerCase()}`}
          onPress={() => onStatusPress(badge.status)}
          style={({ pressed }) => [
            styles.badge,
            { backgroundColor: badge.backgroundColor, borderColor: badge.borderColor },
            activeStatus === badge.status && styles.badgeActive,
            pressed && styles.badgePressed,
          ]}
        >
          <Text style={[styles.count, { color: badge.color }]}>{badge.count}</Text>
          <Text style={[styles.label, { color: badge.color }]}>{badge.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  badge: {
    flex: 1,
    height: 84,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeActive: {
    borderWidth: 2,
  },
  badgePressed: {
    opacity: 0.72,
  },
  count: {
    fontSize: 20,
    fontWeight: "700",
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 3,
  },
});
