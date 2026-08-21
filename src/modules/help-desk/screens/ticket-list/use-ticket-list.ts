import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@core/contexts/auth";
import { useInstitution } from "@core/contexts/institution";
import { createApiClient } from "@core/services/api/client";
import { useToast } from "@core/components/ui/toast";
import { AppApiError } from "@core/services/api/app-api-error";
import {
  getHoursConsumption,
  getTickets,
  getTicketStatusSummary,
} from "@modules/help-desk/repository/tickets-repository";
import { DataHoursConsumption, DataTicket } from "@modules/help-desk/repository/ticket-type";

export function useTicketList() {
  const { loggedUser, logout } = useAuth();
  const { selectedInstitution } = useInstitution();
  const { showToast } = useToast();
  const apiClient = useMemo(
    () => (loggedUser ? createApiClient(loggedUser.environment, loggedUser.jwtToken) : null),
    [loggedUser],
  );

  const [tickets, setTickets] = useState<DataTicket[]>([]);
  const [hoursConsumption, setHoursConsumption] = useState<DataHoursConsumption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestSequence = useRef(0);

  const loadTickets = useCallback(async () => {
    if (!apiClient || !selectedInstitution) return;
    const requestId = ++requestSequence.current;

    setIsLoading(true);
    setTickets([]);
    setHoursConsumption(null);
    try {
      const [ticketsResponse, hoursResponse] = await Promise.all([
        getTickets(apiClient, selectedInstitution.id),
        getHoursConsumption(apiClient, selectedInstitution.id),
      ]);
      if (requestId !== requestSequence.current) return;
      setTickets(ticketsResponse);
      setHoursConsumption(hoursResponse);
    } catch (error) {
      if (requestId !== requestSequence.current) return;
      if (error instanceof AppApiError && error.isAuthError) {
        showToast("Sua sessão expirou. Faça login novamente.", "error");
        await logout();
        return;
      }

      const message =
        error instanceof AppApiError ? error.message : "Não foi possível carregar os chamados";
      showToast(message, "error");
    } finally {
      if (requestId === requestSequence.current) setIsLoading(false);
    }
  }, [apiClient, logout, selectedInstitution, showToast]);

  useFocusEffect(
    useCallback(() => {
      void loadTickets();
    }, [loadTickets]),
  );

  return {
    loggedUser,
    tickets,
    statusSummary: getTicketStatusSummary(tickets),
    hoursConsumption,
    isLoading,
    refresh: loadTickets,
  };
}
