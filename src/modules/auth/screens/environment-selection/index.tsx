import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowRight, Box } from "lucide-react-native";
import { BrandLogo } from "@core/components/ui/brand-logo";
import { colors } from "@core/theme/colors";
import { resolveEnvironmentFromSlug } from "@modules/auth/utils/resolve-environment-from-slug";
import { RootStackParamList } from "@core/routers/root-stack-type";

export function EnvironmentSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [environmentInput, setEnvironmentInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleEnvironmentChange(value: string) {
    setEnvironmentInput(value);
    setErrorMessage("");
  }

  function handleInputSubmit() {
    const normalizedInput = environmentInput.trim().toLowerCase();
    const environmentAddress = normalizedInput.includes(".")
      ? normalizedInput
      : `${normalizedInput}.gpm.srv.br`;
    const environment = resolveEnvironmentFromSlug(environmentAddress);
    if (!environment) {
      setErrorMessage("Ambiente não encontrado");
      return;
    }

    navigation.navigate("Login", { environment });
  }

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
            <Text style={styles.title}>Para iniciarmos</Text>
            <Text style={styles.subtitle}>Informe o ambiente</Text>

            <View style={styles.inputContainer}>
              <Box size={20} color={colors.text.primary} />
              <TextInput
                value={environmentInput}
                onChangeText={handleEnvironmentChange}
                placeholder="Ambiente"
                placeholderTextColor={colors.text.secondary}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={handleInputSubmit}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
            <Text style={styles.addressSuffix}>.gpm.srv.br</Text>

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                !environmentInput.trim() && styles.submitButtonDisabled,
              ]}
              onPress={handleInputSubmit}
              disabled={!environmentInput.trim()}
            >
              <Text style={styles.submitButtonText}>Próximo</Text>
              <ArrowRight size={23} color={colors.text.onPrimary} />
            </Pressable>
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
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text.primary,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text.primary,
    lineHeight: 30,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.background.subtle,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    height: "100%",
    color: colors.text.primary,
    fontSize: 14,
  },
  addressSuffix: {
    color: colors.text.primary,
    fontSize: 18,
    textAlign: "right",
    marginTop: 10,
    marginRight: 8,
  },
  errorMessage: {
    color: colors.text.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 8,
  },
  submitButton: {
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 28,
  },
  submitButtonPressed: {
    backgroundColor: colors.brand.primaryPressed,
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitButtonText: {
    color: colors.text.onPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
});
