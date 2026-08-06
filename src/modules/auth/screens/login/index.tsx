import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Button } from "@core/components/ui/button";
import { InputLabel } from "@core/components/ui/input-label";
import { BrandLogo } from "@core/components/ui/brand-logo";
import { colors } from "@core/theme/colors";
import { RootStackParamList } from "@core/routers/root-stack-type";
import { useLogin } from "./use-login";

export function LoginScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, "Login">>();
  const { environment } = params;

  const {
    username,
    setUsername,
    password,
    setPassword,
    isSubmitting,
    loginErrorMessage,
    handleLoginSubmit,
    isSubmitDisabled,
  } = useLogin({ environment });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <BrandLogo variant="onPrimary" size="lg" />
      </View>

      <View style={styles.content}>
        <Text style={styles.pageTitle}>Acesse sua conta</Text>

        <View style={styles.card}>
          <InputLabel
            label="Usuário"
            value={username}
            onChangeText={setUsername}
            autoCorrect={false}
          />
          <InputLabel label="Senha" value={password} onChangeText={setPassword} isPassword />

          {loginErrorMessage ? <Text style={styles.errorMessage}>{loginErrorMessage}</Text> : null}

          <Button
            label="Entrar"
            onPress={handleLoginSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitDisabled}
            style={styles.submitButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.screen,
  },
  header: {
    backgroundColor: colors.brand.primary,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.background.screen,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  submitButton: {
    marginTop: 12,
  },
  errorMessage: {
    marginTop: 4,
    color: colors.text.error,
    fontSize: 13,
  },
});
