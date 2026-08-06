import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@core/contexts/auth";
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
  const { showToast } = useToast();
  const apiClient = useMemo(
    () => (loggedUser ? createApiClient(loggedUser.environment, loggedUser.jwtToken) : null),
    [loggedUser],
  );

  const [tickets, setTickets] = useState<DataTicket[]>([]);
  const [hoursConsumption, setHoursConsumption] = useState<DataHoursConsumption | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    if (!apiClient) return;

    setIsLoading(true);
    try {
      const [ticketsResponse, hoursResponse] = await Promise.all([
        getTickets(apiClient),
        getHoursConsumption(apiClient),
      ]);
      setTickets(ticketsResponse);
      setHoursConsumption(hoursResponse);
    } catch (error) {
      if (error instanceof AppApiError && error.isAuthError) {
        showToast("Sua sessão expirou. Faça login novamente.", "error");
        await logout();
        return;
      }

      const message =
        error instanceof AppApiError ? error.message : "Não foi possível carregar os chamados";
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, logout, showToast]);

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
