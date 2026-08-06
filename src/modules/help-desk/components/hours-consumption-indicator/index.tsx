import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@core/theme/colors";
import { DataHoursConsumption } from "@modules/help-desk/repository/ticket-type";

interface IHoursConsumptionIndicatorProps {
  consumption: DataHoursConsumption;
}

export function HoursConsumptionIndicator({ consumption }: IHoursConsumptionIndicatorProps) {
  const { consumedHours, contractedHours } = consumption;
  const usageRatio = contractedHours > 0 ? Math.min(consumedHours / contractedHours, 1) : 0;
  const isNearLimit = usageRatio >= 0.8;

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Horas de suporte utilizadas</Text>
        <Text style={styles.value}>
          {consumedHours}h / {contractedHours}h
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${usageRatio * 100}%`,
              backgroundColor: isNearLimit ? colors.status.prazoVencido : colors.brand.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  value: {
    fontSize: 11,
    color: colors.text.primary,
    fontWeight: "600",
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border.default,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});
