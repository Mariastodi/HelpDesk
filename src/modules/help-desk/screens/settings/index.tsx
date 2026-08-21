import React from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Info,
  Mic,
  Settings as SettingsIcon,
} from "lucide-react-native";
import { useAuth } from "@core/contexts/auth";
import { RootStackParamList } from "@core/routers/root-stack-type";
import { colors } from "@core/theme/colors";
import { useInstitution } from "@core/contexts/institution";
import { InstitutionSelector } from "@modules/institution/components/institution-selector";

type SettingsNavigation = NativeStackNavigationProp<RootStackParamList, "Settings">;

export function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigation>();
  const { loggedUser } = useAuth();
  const { institutions } = useInstitution();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <ChevronLeft size={24} color={colors.text.onPrimary} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Configurações</Text>
          <Text style={styles.headerSubtitle}>GPM Desk</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <SettingsIcon size={25} color={colors.brand.primary} />
          </View>
          <View style={styles.introText}>
            <Text style={styles.introTitle}>Preferências do aplicativo</Text>
            <Text style={styles.introDescription}>
              Confira permissões e informações usadas no atendimento.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>INSTITUIÇÃO ATIVA</Text>
        <View style={styles.institutionSection}>
          <InstitutionSelector />
          {institutions.length > 1 ? (
            <Text style={styles.institutionHint}>Toque acima para trocar de instituição</Text>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>PERMISSÕES</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Camera size={20} color={colors.brand.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Câmera e fotos</Text>
              <Text style={styles.rowDescription}>Necessárias para anexar imagens ao chamado</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Mic size={20} color={colors.brand.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Microfone e reconhecimento de fala</Text>
              <Text style={styles.rowDescription}>
                Necessários para preencher a descrição por voz
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Pressable
            style={styles.actionRow}
            onPress={() => void Linking.openSettings()}
            accessibilityRole="button"
          >
            <View style={styles.actionLabel}>
              <CircleHelp size={20} color={colors.brand.primary} />
              <Text style={styles.actionText}>Abrir ajustes do aparelho</Text>
            </View>
            <ChevronRight size={20} color={colors.text.secondary} />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>DIAGNÓSTICO</Text>
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ambiente</Text>
            <Text style={styles.detailValue}>{loggedUser?.environment ?? "Não informado"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plataforma</Text>
            <Text style={styles.detailValue}>{Platform.OS === "ios" ? "iOS" : "Android"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Versão</Text>
            <Text style={styles.detailValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.aboutRow}>
          <Info size={17} color={colors.text.secondary} />
          <Text style={styles.aboutText}>GPM Desk · Desenvolvido por GPM Soluções</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand.primary },
  header: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  headerTitle: { color: colors.text.onPrimary, fontSize: 21, fontWeight: "800" },
  headerSubtitle: { color: "rgba(255,255,255,0.78)", fontSize: 13, marginTop: 2 },
  content: {
    flexGrow: 1,
    backgroundColor: colors.background.screen,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
  },
  introCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#F8E9EA",
    marginBottom: 24,
  },
  introIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.screen,
  },
  introText: { flex: 1 },
  introTitle: { color: colors.text.primary, fontSize: 15, fontWeight: "800" },
  introDescription: { color: colors.text.secondary, fontSize: 12, lineHeight: 17, marginTop: 3 },
  sectionTitle: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginLeft: 4,
    marginBottom: 8,
  },
  institutionSection: { marginBottom: 23 },
  institutionHint: { color: colors.text.secondary, fontSize: 11, marginTop: 7, marginLeft: 4 },
  card: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 16,
    backgroundColor: colors.background.screen,
    paddingHorizontal: 15,
    marginBottom: 23,
  },
  row: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: 12 },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8E9EA",
  },
  rowText: { flex: 1 },
  rowTitle: { color: colors.text.primary, fontSize: 14, fontWeight: "700" },
  rowDescription: { color: colors.text.secondary, fontSize: 11, lineHeight: 16, marginTop: 3 },
  divider: { height: 1, backgroundColor: colors.border.default },
  actionRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionLabel: { flexDirection: "row", alignItems: "center", gap: 10 },
  actionText: { color: colors.brand.primary, fontSize: 13, fontWeight: "700" },
  detailRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
  },
  detailLabel: { color: colors.text.secondary, fontSize: 13 },
  detailValue: { flexShrink: 1, color: colors.text.primary, fontSize: 13, fontWeight: "700" },
  aboutRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7 },
  aboutText: { color: colors.text.secondary, fontSize: 11 },
});
