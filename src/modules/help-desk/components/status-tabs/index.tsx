import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@core/theme/colors";
import { IStatusTabsProps } from "./status-tabs-type";

export function StatusTabs({ summary }: IStatusTabsProps) {
  const badges = [
    {
      count: summary.awaitingService,
      label: "ATEND.",
      color: "#285DE5",
      backgroundColor: "#EDF4FF",
      borderColor: "#D5E3FA",
    },
    {
      count: summary.lateOrDueSoon,
      label: "AG.\nAGUARD.",
      color: "#C35B00",
      backgroundColor: "#FFF9EA",
      borderColor: "#F6E4B4",
    },
    {
      count: summary.awaitingValidation,
      label: "VALIDAÇÃO",
      color: "#079447",
      backgroundColor: "#EAF9F0",
      borderColor: "#D1EFDC",
    },
    {
      count: summary.closed,
      label: "ENCERRAD.",
      color: "#3A4658",
      backgroundColor: colors.background.screen,
      borderColor: "#E9EEF3",
    },
  ];

  return (
    <View style={styles.row}>
      {badges.map((badge) => (
        <View
          key={badge.label}
          style={[
            styles.badge,
            { backgroundColor: badge.backgroundColor, borderColor: badge.borderColor },
          ]}
        >
          <Text style={[styles.count, { color: badge.color }]}>{badge.count}</Text>
          <Text style={[styles.label, { color: badge.color }]}>{badge.label}</Text>
        </View>
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
