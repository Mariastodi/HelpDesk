import React from "react";
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, Text } from "react-native";
import { colors } from "@core/theme/colors";

interface IButtonProps extends PressableProps {
  label: string;
  isLoading?: boolean;
  variant?: "primary" | "outline";
}

export function Button({
  label,
  isLoading,
  variant = "primary",
  disabled,
  style,
  ...rest
}: IButtonProps) {
  const isOutline = variant === "outline";

  return (
    <Pressable
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : styles.primary,
        (disabled || isLoading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style as object,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={isOutline ? colors.brand.primary : colors.text.onPrimary} />
      ) : (
        <Text style={[styles.label, isOutline && styles.labelOutline]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: colors.brand.primary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.brand.primary,
  },
  pressed: {
    backgroundColor: colors.brand.primaryPressed,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.text.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  labelOutline: {
    color: colors.brand.primary,
  },
});
