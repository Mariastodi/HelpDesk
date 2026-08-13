import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  AlertTriangle,
  CircleHelp,
  Headphones,
  Home,
  Info,
  ListFilter,
  LogOut,
  Menu,
  Plus,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  X,
} from "lucide-react-native";
import { colors } from "@core/theme/colors";
import { useAuth } from "@core/contexts/auth";
import { useToast } from "@core/components/ui/toast";
import { RootStackParamList } from "@core/routers/root-stack-type";
import { StatusTabs } from "@modules/help-desk/components/status-tabs";
import { TicketCard } from "@modules/help-desk/components/ticket-card";
import { TicketStatus } from "@modules/help-desk/enums/ticket-status";
import { DataTicket } from "@modules/help-desk/repository/ticket-type";
import { useTicketList } from "./use-ticket-list";
import { appConfig } from "@core/config/app-config";

type SortOption = "ABERTURA" | "PRAZO" | "PRIORIDADE";
type StatusFilterOption = TicketStatus | "TODOS" | "AGUARDANDO";
type DrawerDestination = "information" | "help" | "settings";

const STATUS_FILTER_OPTIONS: { label: string; value: StatusFilterOption }[] = [
  { label: "Todos", value: "TODOS" },
  { label: "Em atendimento", value: TicketStatus.EM_ATENDIMENTO },
  { label: "Aguardando", value: "AGUARDANDO" },
  { label: "Validação", value: TicketStatus.AGUARDANDO_VALIDACAO_USUARIO },
  { label: "Encerrado", value: TicketStatus.ENCERRADO },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Data de abertura", value: "ABERTURA" },
  { label: "Prazo de vencimento", value: "PRAZO" },
  { label: "Prioridade", value: "PRIORIDADE" },
];

const PRIORITY_WEIGHT: Record<TicketStatus, number> = {
  [TicketStatus.EM_ATENDIMENTO]: 1,
  [TicketStatus.AGUARDANDO_ATENDIMENTO]: 2,
  [TicketStatus.AGUARDANDO_ANALISE_CONTROLLER]: 2,
  [TicketStatus.AGUARDANDO_VALIDACAO_USUARIO]: 3,
  [TicketStatus.ENCERRADO]: 4,
  [TicketStatus.CANCELADO]: 5,
};

function parseBrazilianDate(value: string, isEndOfDay = false): Date | null {
  if (!value.trim()) return null;

  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return null;

  const parsedDate = new Date(year, month - 1, day);
  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  if (isEndOfDay) parsedDate.setHours(23, 59, 59, 999);
  return parsedDate;
}

function getGreeting(currentHour: number): string {
  if (currentHour < 12) return "Bom dia,";
  if (currentHour < 18) return "Boa tarde,";
  return "Boa noite,";
}

export function TicketListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { loggedUser, tickets, statusSummary, hoursConsumption, isLoading } = useTicketList();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isInformationOpen, setIsInformationOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const pendingDrawerDestination = useRef<DrawerDestination>();
  const [isHoursAlertDismissed, setIsHoursAlertDismissed] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("TODOS");
  const [sortOption, setSortOption] = useState<SortOption>("ABERTURA");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const drawerTranslateX = useRef(new Animated.Value(-Dimensions.get("window").width)).current;
  const userDisplayName = loggedUser?.userName ?? "Usuário";
  const userLogin =
    loggedUser?.userLogin ?? userDisplayName.trim().replace(/\s+/g, ".").toUpperCase();
  const greeting = getGreeting(new Date().getHours());

  const isHoursAlertVisible = Boolean(
    !isHoursAlertDismissed &&
    hoursConsumption &&
    hoursConsumption.contractedHours > 0 &&
    hoursConsumption.consumedHours / hoursConsumption.contractedHours >= 0.85,
  );

  useEffect(() => {
    if (isDrawerOpen) {
      setIsDrawerVisible(true);
      Animated.timing(drawerTranslateX, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (isDrawerVisible) {
      Animated.timing(drawerTranslateX, {
        toValue: -Dimensions.get("window").width,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setIsDrawerVisible(false));
    }
  }, [drawerTranslateX, isDrawerOpen, isDrawerVisible]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    const startDate = parseBrazilianDate(startDateInput);
    const endDate = parseBrazilianDate(endDateInput, true);

    const matchingTickets = tickets.filter((ticket) => {
      const isAwaitingTicket =
        ticket.status === TicketStatus.AGUARDANDO_ATENDIMENTO ||
        ticket.status === TicketStatus.AGUARDANDO_ANALISE_CONTROLLER;
      const matchesStatus =
        statusFilter === "TODOS" ||
        ticket.status === statusFilter ||
        (statusFilter === "AGUARDANDO" && isAwaitingTicket);
      const matchesSearch =
        !normalizedSearch ||
        ticket.ticketID.toLowerCase().includes(normalizedSearch) ||
        ticket.description.toLowerCase().includes(normalizedSearch);
      const matchesStartDate = !startDate || ticket.openedAt >= startDate;
      const matchesEndDate = !endDate || ticket.openedAt <= endDate;

      return matchesStatus && matchesSearch && matchesStartDate && matchesEndDate;
    });

    return [...matchingTickets].sort((firstTicket, secondTicket) => {
      if (sortOption === "PRAZO") {
        return firstTicket.deadlineDate.getTime() - secondTicket.deadlineDate.getTime();
      }

      if (sortOption === "PRIORIDADE") {
        return (
          PRIORITY_WEIGHT[firstTicket.status] - PRIORITY_WEIGHT[secondTicket.status] ||
          secondTicket.openedAt.getTime() - firstTicket.openedAt.getTime()
        );
      }

      return secondTicket.openedAt.getTime() - firstTicket.openedAt.getTime();
    });
  }, [endDateInput, searchText, sortOption, startDateInput, statusFilter, tickets]);

  async function handleLogout() {
    setIsDrawerOpen(false);
    await logout();
  }

  async function handleChangeEnvironment() {
    setIsDrawerOpen(false);
    await logout();
  }

  async function handleOpenSupport() {
    try {
      await Linking.openURL(appConfig.supportUrl);
    } catch {
      showToast("Não foi possível abrir o WhatsApp", "error");
    }
  }

  function handleOpenDrawerDestination(destination: DrawerDestination) {
    pendingDrawerDestination.current = destination;
    setIsDrawerOpen(false);
  }

  function handleDrawerDismiss() {
    const destination = pendingDrawerDestination.current;
    pendingDrawerDestination.current = undefined;

    if (destination === "information") setIsInformationOpen(true);
    if (destination === "help") setIsHelpOpen(true);
    if (destination === "settings") navigation.navigate("Settings");
  }

  function handleClearFilters() {
    setStatusFilter("TODOS");
    setSortOption("ABERTURA");
    setStartDateInput("");
    setEndDateInput("");
  }

  function handleTicketPress(ticket: DataTicket) {
    navigation.navigate("TicketDetail", {
      ticket: {
        ...ticket,
        openedAt: ticket.openedAt.toISOString(),
        deadlineDate: ticket.deadlineDate.toISOString(),
      },
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={styles.menuButton} hitSlop={12} onPress={() => setIsDrawerOpen(true)}>
          <Menu color={colors.text.onPrimary} size={29} />
        </Pressable>
        <View style={styles.greeting}>
          <Text style={styles.greetingHello}>{greeting}</Text>
          <Text
            style={styles.greetingName}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
          >
            {userDisplayName.toUpperCase()}
          </Text>
          <Text style={styles.userRegistration} numberOfLines={1}>
            Mat. {userLogin.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.contentPanel}>
        <StatusTabs summary={statusSummary} />

        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Search size={18} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por ID ou descrição"
              placeholderTextColor={colors.text.secondary}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
          </View>
          <Pressable style={styles.filterIconButton} onPress={() => setIsFilterOpen(true)}>
            <SlidersHorizontal size={19} color={colors.text.secondary} />
          </Pressable>
          <Pressable style={styles.filterIconButton} onPress={() => setIsFilterOpen(true)}>
            <ListFilter size={19} color={colors.text.secondary} />
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} color={colors.brand.primary} />
        ) : (
          <FlatList
            data={filteredTickets}
            keyExtractor={(ticket) => ticket.ticketID}
            renderItem={({ item }) => <TicketCard ticket={item} onPress={handleTicketPress} />}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum chamado encontrado</Text>}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>

      <Pressable style={styles.newTicketButton} onPress={() => navigation.navigate("NewTicket")}>
        <Plus color={colors.text.onPrimary} size={31} />
      </Pressable>

      <Modal
        transparent
        visible={isDrawerVisible}
        animationType="none"
        onDismiss={handleDrawerDismiss}
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <Animated.View
            style={[styles.drawerPanel, { transform: [{ translateX: drawerTranslateX }] }]}
          >
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerName}>{userDisplayName.toUpperCase()}</Text>
              <Text style={styles.drawerSubtext}>Mat. {userLogin.toUpperCase()}</Text>
            </View>
            <View style={styles.drawerList}>
              <Pressable
                style={[styles.drawerItem, styles.drawerItemActive]}
                onPress={() => setIsDrawerOpen(false)}
              >
                <Home size={21} color={colors.brand.primary} />
                <Text style={[styles.drawerItemText, styles.drawerItemTextActive]}>Home</Text>
              </Pressable>
              <Pressable
                style={styles.drawerItem}
                onPress={() => handleOpenDrawerDestination("information")}
              >
                <Info size={21} color="#3A3A3A" />
                <Text style={styles.drawerItemText}>Informações</Text>
              </Pressable>
              <Pressable
                style={styles.drawerItem}
                onPress={() => handleOpenDrawerDestination("help")}
              >
                <CircleHelp size={21} color="#3A3A3A" />
                <Text style={styles.drawerItemText}>Central de ajuda</Text>
              </Pressable>
              <Pressable
                style={styles.drawerItem}
                onPress={() => handleOpenDrawerDestination("settings")}
              >
                <Settings size={21} color="#3A3A3A" />
                <Text style={styles.drawerItemText}>Configurações</Text>
              </Pressable>
            </View>
            <View style={styles.drawerSessionSection}>
              <Pressable style={styles.drawerItem} onPress={handleChangeEnvironment}>
                <RotateCcw size={21} color="#3A3A3A" />
                <Text style={styles.drawerItemText}>Redefinir ambiente</Text>
              </Pressable>
              <Pressable style={styles.drawerItem} onPress={handleLogout}>
                <LogOut size={21} color="#3A3A3A" />
                <Text style={styles.drawerItemText}>Sair</Text>
              </Pressable>
            </View>
          </Animated.View>
          <Pressable style={styles.drawerBackdrop} onPress={() => setIsDrawerOpen(false)} />
        </View>
      </Modal>

      <Modal
        transparent
        visible={isInformationOpen}
        animationType="fade"
        onRequestClose={() => setIsInformationOpen(false)}
      >
        <View style={styles.menuModalOverlay}>
          <View style={styles.menuModalCard}>
            <View style={styles.menuModalHeader}>
              <Text style={styles.menuModalTitle}>Informações</Text>
              <Pressable hitSlop={10} onPress={() => setIsInformationOpen(false)}>
                <X size={22} color={colors.text.secondary} />
              </Pressable>
            </View>
            <Info size={42} color={colors.brand.primary} />
            <View style={styles.informationList}>
              <Text style={styles.informationLabel}>AMBIENTE</Text>
              <Text style={styles.informationValue}>{loggedUser?.environment ?? "-"}</Text>
              <Text style={styles.informationLabel}>USUÁRIO</Text>
              <Text style={styles.informationValue}>{userLogin.toUpperCase()}</Text>
              <Text style={styles.informationLabel}>DESENVOLVIDO POR</Text>
              <Text style={styles.informationValue}>GPM SOLUÇÕES</Text>
              <Text style={styles.informationLabel}>VERSÃO</Text>
              <Text style={styles.informationValue}>1.0.0</Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={isHelpOpen}
        animationType="fade"
        onRequestClose={() => setIsHelpOpen(false)}
      >
        <View style={styles.menuModalOverlay}>
          <View style={styles.helpModalCard}>
            <View style={styles.menuModalHeader}>
              <Text style={styles.menuModalTitle}>Central de ajuda</Text>
              <Pressable hitSlop={10} onPress={() => setIsHelpOpen(false)}>
                <X size={22} color={colors.text.secondary} />
              </Pressable>
            </View>
            <View style={styles.helpItem}>
              <Text style={styles.helpQuestion}>Qual ambiente devo informar?</Text>
              <Text style={styles.helpAnswer}>
                Use o mesmo ambiente utilizado para acessar o sistema web.
              </Text>
            </View>
            <View style={styles.helpItem}>
              <Text style={styles.helpQuestion}>Como anexar fotos e documentos?</Text>
              <Text style={styles.helpAnswer}>
                Em Novo Chamado, toque em Adicionar anexo e escolha câmera, galeria ou documentos.
              </Text>
            </View>
            <View style={styles.helpItem}>
              <Text style={styles.helpQuestion}>Ainda precisa de ajuda?</Text>
              <Text style={styles.helpAnswer}>
                Fale diretamente com a equipe de suporte pelo WhatsApp.
              </Text>
            </View>
            <Pressable style={styles.helpSupportButton} onPress={handleOpenSupport}>
              <Headphones size={19} color={colors.text.onPrimary} />
              <Text style={styles.helpSupportButtonText}>Falar com o suporte</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={isFilterOpen} animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsFilterOpen(false)} />
          <View style={styles.filterPanel}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filtros</Text>
              <Pressable onPress={handleClearFilters}>
                <Text style={styles.filterClear}>Limpar</Text>
              </Pressable>
            </View>

            <Text style={styles.filterSectionTitle}>Status do chamado</Text>
            <View style={styles.filterStatusRow}>
              {STATUS_FILTER_OPTIONS.map((option) => {
                const isSelected = statusFilter === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.filterStatusButton,
                      isSelected && styles.filterStatusButtonActive,
                    ]}
                    onPress={() => setStatusFilter(option.value)}
                  >
                    <Text
                      style={[
                        styles.filterStatusButtonText,
                        isSelected && styles.filterStatusButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.filterSectionTitle}>Ordenação</Text>
            <View style={styles.filterOrderCard}>
              {SORT_OPTIONS.map((option) => {
                const isSelected = sortOption === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={styles.filterOrderRow}
                    onPress={() => setSortOption(option.value)}
                  >
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                      {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>
                    <Text style={styles.filterOrderLabel}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.filterSectionTitle}>Período de abertura</Text>
            <View style={styles.filterDatesRow}>
              <TextInput
                style={styles.filterDateInput}
                placeholder="dd/mm/aaaa"
                placeholderTextColor={colors.text.secondary}
                value={startDateInput}
                onChangeText={setStartDateInput}
                keyboardType="numeric"
                maxLength={10}
              />
              <TextInput
                style={styles.filterDateInput}
                placeholder="dd/mm/aaaa"
                placeholderTextColor={colors.text.secondary}
                value={endDateInput}
                onChangeText={setEndDateInput}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <Pressable style={styles.applyFiltersButton} onPress={() => setIsFilterOpen(false)}>
              <Text style={styles.applyFiltersButtonText}>Aplicar filtros</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={isHoursAlertVisible} animationType="fade">
        <View style={styles.hoursAlertOverlay}>
          <View style={styles.hoursAlertCard}>
            <AlertTriangle size={31} color={colors.brand.primary} />
            <Text style={styles.hoursAlertTitle}>Pacote de horas crítico</Text>
            <Text style={styles.hoursAlertMessage}>
              O consumo das horas de suporte atingiu um nível crítico.
            </Text>
            <Pressable
              style={styles.hoursAlertButton}
              onPress={() => setIsHoursAlertDismissed(true)}
            >
              <Text style={styles.hoursAlertButtonText}>Entendi</Text>
            </Pressable>
          </View>
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
    height: 112,
    backgroundColor: colors.brand.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  menuButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    marginLeft: 14,
  },
  greetingHello: {
    color: colors.text.onPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  greetingName: {
    color: colors.text.onPrimary,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 21,
  },
  userRegistration: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 11,
    lineHeight: 14,
  },
  contentPanel: {
    flex: 1,
    backgroundColor: colors.background.screen,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  searchRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 10,
    marginBottom: 20,
  },
  searchInputWrapper: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 13,
    backgroundColor: "#EDF3F9",
    borderWidth: 1,
    borderColor: "#D8E2EC",
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
  },
  filterIconButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#D8E2EC",
    backgroundColor: "#EDF3F9",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 94,
  },
  loading: {
    marginTop: 48,
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 48,
  },
  newTicketButton: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand.primary,
    borderWidth: 3,
    borderColor: colors.background.screen,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 9,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.24)",
    flexDirection: "row",
  },
  drawerPanel: {
    width: "82%",
    backgroundColor: colors.background.screen,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  drawerBackdrop: {
    flex: 1,
  },
  drawerHeader: {
    marginTop: 24,
    marginHorizontal: 12,
    marginBottom: 24,
  },
  drawerName: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  drawerSubtext: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 3,
  },
  drawerList: {
    gap: 4,
  },
  drawerItem: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  drawerItemActive: {
    backgroundColor: "#F7E7E8",
  },
  drawerItemText: {
    color: colors.text.primary,
    fontSize: 15,
  },
  drawerItemTextActive: {
    color: colors.brand.primary,
    fontWeight: "700",
  },
  drawerSessionSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    marginTop: 16,
    paddingTop: 12,
  },
  menuModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.34)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  menuModalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 22,
    backgroundColor: colors.background.screen,
    padding: 22,
    alignItems: "center",
  },
  helpModalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 22,
    backgroundColor: colors.background.screen,
    padding: 22,
  },
  menuModalHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  menuModalTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "700",
  },
  informationList: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  informationLabel: {
    color: colors.brand.primary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
  },
  informationValue: {
    color: colors.text.primary,
    fontSize: 14,
    marginTop: 3,
  },
  helpItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingVertical: 12,
  },
  helpQuestion: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  helpAnswer: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  helpSupportButton: {
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.brand.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },
  helpSupportButtonText: {
    color: colors.text.onPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  filterPanel: {
    backgroundColor: colors.background.screen,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  filterTitle: {
    color: colors.text.primary,
    fontSize: 21,
    fontWeight: "700",
  },
  filterClear: {
    color: colors.brand.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  filterSectionTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  filterStatusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  filterStatusButton: {
    borderWidth: 1,
    borderColor: colors.brand.primary,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  filterStatusButtonActive: {
    backgroundColor: colors.brand.primary,
  },
  filterStatusButtonText: {
    color: colors.brand.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  filterStatusButtonTextActive: {
    color: colors.text.onPrimary,
  },
  filterOrderCard: {
    borderRadius: 14,
    backgroundColor: colors.background.subtle,
    paddingVertical: 5,
    marginBottom: 18,
  },
  filterOrderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderWidth: 2,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primary,
  },
  filterOrderLabel: {
    color: colors.text.primary,
    fontSize: 14,
  },
  filterDatesRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  filterDateInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: colors.text.primary,
  },
  applyFiltersButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  applyFiltersButtonText: {
    color: colors.text.onPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  hoursAlertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  hoursAlertCard: {
    borderRadius: 22,
    backgroundColor: colors.background.screen,
    padding: 24,
    alignItems: "center",
  },
  hoursAlertTitle: {
    color: colors.text.primary,
    fontSize: 19,
    fontWeight: "700",
    marginTop: 14,
  },
  hoursAlertMessage: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  hoursAlertButton: {
    backgroundColor: colors.brand.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 20,
  },
  hoursAlertButtonText: {
    color: colors.text.onPrimary,
    fontWeight: "700",
  },
});
