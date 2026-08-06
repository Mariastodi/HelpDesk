import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { colors } from "@core/theme/colors";
import logoSource from "@assets/LOGOGPM.png";

interface IBrandLogoProps {
  variant?: "onPrimary" | "onLight";
  size?: "md" | "lg";
}

export function BrandLogo({ variant = "onPrimary", size = "lg" }: IBrandLogoProps) {
  const width = size === "lg" ? 240 : 140;
  const height = size === "lg" ? 94 : 55;
  const containerStyle = variant === "onPrimary" ? styles.wrapperOnPrimary : styles.wrapperOnLight;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Image source={logoSource} style={{ width, height, resizeMode: "contain" }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  wrapperOnPrimary: {
    backgroundColor: colors.brand.primary,
  },
  wrapperOnLight: {
    backgroundColor: colors.background.screen,
  },
});
