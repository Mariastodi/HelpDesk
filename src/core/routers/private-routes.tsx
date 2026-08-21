import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Building2 } from "lucide-react-native";
import { useInstitution } from "@core/contexts/institution";
import { useAuth } from "@core/contexts/auth";
import { colors } from "@core/theme/colors";
import { InstitutionSelector } from "@modules/institution/components/institution-selector";
import { HelpDeskRoutes } from "@modules/help-desk/routers/help-desk-routes";

export function PrivateRoutes() {
  const { logout } = useAuth();
  const {
    institutions,
    selectedInstitution,
    isLoadingInstitutions,
    errorMessage,
    refreshInstitutions,
  } = useInstitution();

  if (isLoadingInstitutions) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={styles.loadingText}>Carregando instituições...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Building2 size={42} color={colors.brand.primary} />
        <Text style={styles.title}>Não foi possível carregar as instituições</Text>
        <Text style={styles.message}>{errorMessage}</Text>
        <Pressable style={styles.retryButton} onPress={() => void refreshInstitutions()}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  if (institutions.length === 0) {
    return (
      <View style={styles.centered}>
        <Building2 size={46} color={colors.brand.primary} />
        <Text style={styles.title}>Nenhuma instituição vinculada</Text>
        <Text style={styles.message}>
          Seu usuário não possui uma instituição vinculada. Entre em contato com o suporte.
        </Text>
        <Pressable style={styles.retryButton} onPress={() => void logout()}>
          <Text style={styles.retryButtonText}>Voltar ao login</Text>
        </Pressable>
      </View>
    );
  }

  if (!selectedInstitution) {
    return (
      <View style={styles.centered}>
        <InstitutionSelector required />
      </View>
    );
  }

  return <HelpDeskRoutes />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background.screen,
  },
  loadingText: { color: colors.text.secondary, fontSize: 13, marginTop: 12 },
  title: { color: colors.text.primary, fontSize: 19, fontWeight: "800", marginTop: 18 },
  message: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
  },
  retryButton: {
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 24,
    marginTop: 20,
    backgroundColor: colors.brand.primary,
  },
  retryButtonText: { color: colors.text.onPrimary, fontSize: 14, fontWeight: "800" },
});
