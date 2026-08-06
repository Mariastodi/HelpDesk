import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "@core/contexts/auth";
import { colors } from "@core/theme/colors";
import { navigationRef } from "./navigationRef";
import { FreeRoutes } from "./free-routes";
import { PrivateRoutes } from "./private-routes";

export function Routes() {
  const { isLogged, isRestoringSession } = useAuth();

  if (isRestoringSession) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {isLogged ? <PrivateRoutes /> : <FreeRoutes />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.screen,
  },
});
