import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <BrandLogo variant="onPrimary" size="lg" />
        </View>

        <View style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.pageTitle}>Acesse sua conta</Text>
            <InputLabel
              label="Usuário"
              value={username}
              onChangeText={setUsername}
              autoCorrect={false}
            />
            <InputLabel label="Senha" value={password} onChangeText={setPassword} isPassword />

            {loginErrorMessage ? (
              <Text style={styles.errorMessage}>{loginErrorMessage}</Text>
            ) : null}

            <Button
              label="Entrar"
              onPress={handleLoginSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitDisabled}
              style={styles.submitButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand.primary,
  },
  keyboardArea: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.brand.primary,
    flex: 1.05,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 16,
  },
  content: {
    flex: 0.95,
    backgroundColor: colors.background.screen,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 32,
    paddingTop: 34,
  },
  form: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text.primary,
    lineHeight: 30,
    marginBottom: 24,
  },
  submitButton: {
    height: 44,
    borderRadius: 22,
    marginTop: 8,
  },
  errorMessage: {
    marginTop: 4,
    color: colors.text.error,
    fontSize: 13,
  },
});
