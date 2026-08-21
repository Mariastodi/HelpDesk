import React, { useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Check, ChevronLeft, FileSpreadsheet, FileText, Settings, X } from "lucide-react-native";
import { colors } from "@core/theme/colors";
import { RootStackParamList } from "@core/routers/root-stack-type";
import { DataTicket } from "@modules/help-desk/repository/ticket-type";
import { TicketStatus } from "@modules/help-desk/enums/ticket-status";
import { useInstitution } from "@core/contexts/institution";

type TicketDetailRouteProp = RouteProp<RootStackParamList, "TicketDetail">;

interface DataFlowStep {
  index: number;
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

const FLOW_LABELS = ["Análise", "Aguardando", "Atendendo", "Validação", "Encerrado"];

const STATUS_FLOW_INDEX: Record<TicketStatus, number> = {
  [TicketStatus.AGUARDANDO_ANALISE_CONTROLLER]: 0,
  [TicketStatus.AGUARDANDO_ATENDIMENTO]: 1,
  [TicketStatus.EM_ATENDIMENTO]: 2,
  [TicketStatus.AGUARDANDO_VALIDACAO_USUARIO]: 3,
  [TicketStatus.ENCERRADO]: 4,
  [TicketStatus.CANCELADO]: 4,
};

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function formatDate(date: Date): string {
  return isValidDate(date) ? date.toLocaleDateString("pt-BR") : "Não informado";
}

function formatHistoryDate(date: Date): string {
  if (!isValidDate(date)) return "Data não informada";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month} ${hours}:${minutes}`;
}

function getFlowSteps(status: TicketStatus): DataFlowStep[] {
  const currentStepIndex = STATUS_FLOW_INDEX[status] ?? 0;
  return FLOW_LABELS.map((label, index) => ({
    index,
    label,
    isCompleted: index < currentStepIndex,
    isCurrent: index === currentStepIndex,
  }));
}

export function TicketDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectedInstitution } = useInstitution();
  const route = useRoute<TicketDetailRouteProp>();
  const routeTicket = route.params.ticket;
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string>();

  const ticket = useMemo<DataTicket>(() => {
    const openedAt =
      typeof routeTicket.openedAt === "string"
        ? new Date(routeTicket.openedAt)
        : routeTicket.openedAt;
    const deadlineDate =
      typeof routeTicket.deadlineDate === "string"
        ? new Date(routeTicket.deadlineDate)
        : routeTicket.deadlineDate;

    return { ...routeTicket, openedAt, deadlineDate };
  }, [routeTicket]);

  const flowSteps = useMemo(() => getFlowSteps(ticket.status), [ticket.status]);
  const attachments = ticket.attachments ?? [];
  const imageAttachmentsCount = attachments.filter((attachment) =>
    attachment.mimeType?.startsWith("image/"),
  ).length;
  const currentFlowIndex = STATUS_FLOW_INDEX[ticket.status] ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} hitSlop={12} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={colors.text.onPrimary} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>

        <Text style={styles.ticketID}>{ticket.ticketID}</Text>
        <Text style={styles.ticketTitle}>{ticket.description}</Text>
        <Text style={styles.ticketLocation}>{selectedInstitution?.name ?? "Instituição"}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>ABERTURA</Text>
          <Text style={styles.infoValue}>{formatDate(ticket.openedAt)}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>PRAZO</Text>
          <Text style={styles.deadlineValue}>{formatDate(ticket.deadlineDate)}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>ATENDENTE</Text>
          <Text style={styles.infoValue}>{ticket.attendantName ?? "Aguardando"}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.flowCard}>
          <Text style={styles.sectionTitle}>FLUXO DO ATENDIMENTO</Text>
          <View style={styles.flowTrack}>
            <View style={styles.flowBaseLine} />
            <View
              style={[
                styles.flowProgressLine,
                {
                  width: `${(currentFlowIndex / (FLOW_LABELS.length - 1)) * 100}%`,
                },
              ]}
            />
            {flowSteps.map((step) => (
              <View key={step.label} style={styles.flowStep}>
                <View
                  style={[
                    styles.flowCircle,
                    step.isCompleted && styles.completedCircle,
                    step.isCurrent && styles.currentCircle,
                  ]}
                >
                  {step.isCompleted ? (
                    <Check size={17} strokeWidth={2.5} color={colors.text.onPrimary} />
                  ) : (
                    <Text style={[styles.flowNumber, step.isCurrent && styles.currentFlowNumber]}>
                      {step.index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.flowLabel,
                    (step.isCompleted || step.isCurrent) && styles.activeFlowLabel,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {attachments.length > 0 ? (
          <View style={styles.attachmentsSection}>
            <Text style={styles.attachmentsTitle}>ANEXOS</Text>
            <View style={styles.attachmentsGrid}>
              {attachments.map((attachment) =>
                attachment.mimeType?.startsWith("image/") ? (
                  <Pressable
                    key={attachment.uri}
                    style={({ pressed }) => [
                      styles.photoCard,
                      imageAttachmentsCount === 1 && styles.singlePhotoCard,
                      pressed && styles.photoCardPressed,
                    ]}
                    onPress={() => setSelectedPhotoUri(attachment.uri)}
                  >
                    <Image
                      source={{ uri: attachment.uri }}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                    <Text style={styles.photoName} numberOfLines={1}>
                      {attachment.name}
                    </Text>
                    <Text style={styles.openPhotoLabel}>Toque para ampliar</Text>
                  </Pressable>
                ) : (
                  <View key={attachment.uri} style={styles.documentCard}>
                    {attachment.mimeType?.includes("spreadsheet") ||
                    attachment.mimeType?.includes("excel") ? (
                      <FileSpreadsheet size={23} color="#178A4A" />
                    ) : (
                      <FileText size={23} color="#D14949" />
                    )}
                    <Text style={styles.documentName} numberOfLines={1}>
                      {attachment.name}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </View>
        ) : null}

        <Text style={styles.historyTitle}>HISTÓRICO</Text>

        <View style={styles.historyTimeline}>
          <View style={styles.historyRail} />
          <View style={styles.historyEntry}>
            <View style={styles.systemIconWrapper}>
              <Settings size={16} color="#75696B" />
            </View>
            <View style={styles.historyMessageCard}>
              <View style={styles.historyMessageHeader}>
                <View style={styles.historyAuthorRow}>
                  <Text style={styles.historyAuthor}>Sistema</Text>
                  <Text style={styles.historyAuthorType}>Automático</Text>
                </View>
                <Text style={styles.historyDate}>{formatHistoryDate(ticket.openedAt)}</Text>
              </View>
              <Text style={styles.historyMessage}>Chamado aberto e encaminhado para análise.</Text>
            </View>
          </View>

          <View style={styles.historyEntry}>
            <View style={styles.pendingIconWrapper}>
              <View style={styles.pendingIconDot} />
            </View>
            <View style={styles.pendingCard}>
              <View style={styles.pendingTitle} />
              <View style={styles.pendingText} />
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={Boolean(selectedPhotoUri)}
        animationType="fade"
        onRequestClose={() => setSelectedPhotoUri(undefined)}
      >
        <View style={styles.photoViewer}>
          <Pressable
            style={styles.closePhotoButton}
            hitSlop={12}
            onPress={() => setSelectedPhotoUri(undefined)}
          >
            <X size={27} color={colors.text.onPrimary} />
          </Pressable>
          {selectedPhotoUri ? (
            <Image
              source={{ uri: selectedPhotoUri }}
              style={styles.expandedPhoto}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand.primary,
  },
  header: {
    minHeight: 190,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 48,
    backgroundColor: colors.brand.primary,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    marginLeft: -5,
  },
  backButtonText: {
    color: colors.text.onPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  ticketID: {
    color: colors.text.onPrimary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  ticketTitle: {
    color: colors.text.onPrimary,
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "700",
    maxWidth: 350,
    marginBottom: 10,
  },
  ticketLocation: {
    color: colors.text.onPrimary,
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F4F9FF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 48,
  },
  infoCard: {
    marginTop: -35,
    marginHorizontal: 16,
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.screen,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    zIndex: 2,
  },
  infoColumn: {
    flex: 1,
    alignItems: "center",
  },
  infoDivider: {
    width: 1,
    height: 34,
    backgroundColor: "#F0E2E4",
  },
  infoLabel: {
    color: "#8C7B7E",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 6,
  },
  infoValue: {
    color: "#202631",
    fontSize: 13,
    fontWeight: "700",
  },
  deadlineValue: {
    color: colors.brand.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  flowCard: {
    height: 143,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.background.screen,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#F2EBEC",
  },
  sectionTitle: {
    color: "#61494D",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
  flowTrack: {
    height: 78,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 31,
    marginHorizontal: 1,
  },
  flowBaseLine: {
    position: "absolute",
    left: 1,
    right: 1,
    top: 15,
    height: 2,
    backgroundColor: "#DDE8F2",
  },
  flowProgressLine: {
    position: "absolute",
    left: 1,
    top: 15,
    height: 2,
    backgroundColor: colors.brand.primary,
  },
  flowStep: {
    flex: 1,
    alignItems: "center",
  },
  flowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FBFE",
    borderWidth: 2,
    borderColor: "#DCE7F1",
  },
  completedCircle: {
    backgroundColor: "#08B886",
    borderColor: "#08B886",
  },
  currentCircle: {
    backgroundColor: colors.brand.primary,
    borderWidth: 3,
    borderColor: "#F6D4D6",
  },
  flowNumber: {
    color: "#CAD7E3",
    fontSize: 14,
    fontWeight: "700",
  },
  currentFlowNumber: {
    color: colors.text.onPrimary,
  },
  flowLabel: {
    width: "100%",
    color: "#C5D0DA",
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  activeFlowLabel: {
    color: "#30333A",
  },
  historyTitle: {
    color: "#61494D",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginTop: 18,
    marginLeft: 7,
    marginBottom: 17,
  },
  historyTimeline: {
    position: "relative",
  },
  historyRail: {
    position: "absolute",
    left: 16,
    top: 30,
    bottom: 45,
    width: 2,
    backgroundColor: "#DCE8F3",
  },
  historyEntry: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 17,
    marginBottom: 16,
  },
  systemIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F5F8FB",
    borderWidth: 1,
    borderColor: "#E5EDF4",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  historyMessageCard: {
    flex: 1,
    minHeight: 105,
    paddingHorizontal: 17,
    paddingVertical: 18,
    backgroundColor: colors.background.screen,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#F1ECEC",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  historyMessageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  historyAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  historyAuthor: {
    color: "#202631",
    fontSize: 15,
    fontWeight: "700",
  },
  historyAuthorType: {
    color: "#5F4A4D",
    fontSize: 10,
  },
  historyDate: {
    color: "#5F4A4D",
    fontSize: 10,
  },
  historyMessage: {
    color: "#604C4F",
    fontSize: 13,
    lineHeight: 20,
  },
  pendingIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EFE8F1",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  pendingIconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primary,
  },
  pendingCard: {
    flex: 1,
    height: 63,
    paddingHorizontal: 17,
    paddingVertical: 15,
    backgroundColor: colors.background.screen,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#F1ECEC",
  },
  pendingTitle: {
    width: 88,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#DDE8F3",
    marginBottom: 12,
  },
  pendingText: {
    width: "100%",
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E9F2F9",
  },
  attachmentsSection: {
    marginTop: 18,
    marginBottom: 4,
  },
  attachmentsTitle: {
    color: "#61494D",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginLeft: 7,
    marginBottom: 13,
  },
  attachmentsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoCard: {
    width: "48%",
    overflow: "hidden",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E8EDEF",
    backgroundColor: colors.background.screen,
  },
  singlePhotoCard: {
    width: "100%",
  },
  photoCardPressed: {
    opacity: 0.78,
  },
  photo: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#E7EEF5",
  },
  photoName: {
    color: colors.text.secondary,
    fontSize: 10,
    paddingHorizontal: 9,
    paddingTop: 8,
  },
  openPhotoLabel: {
    color: colors.brand.primary,
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 9,
    paddingTop: 4,
    paddingBottom: 9,
  },
  documentCard: {
    width: "100%",
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E8EDEF",
    backgroundColor: colors.background.screen,
  },
  documentName: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  photoViewer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
    alignItems: "center",
    justifyContent: "center",
  },
  closePhotoButton: {
    position: "absolute",
    top: 54,
    right: 22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  expandedPhoto: {
    width: "100%",
    height: "82%",
  },
});
