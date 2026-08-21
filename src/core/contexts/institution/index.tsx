import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@core/contexts/auth";
import { createApiClient } from "@core/services/api/client";
import {
  getSelectedInstitutionStorageKey,
  localStorage,
} from "@core/services/storage/local-storage";
import { AppApiError } from "@core/services/api/app-api-error";
import { getInstitutions } from "@modules/institution/repository/institutions-repository";
import { DataInstitution } from "@modules/institution/repository/institution-type";
import { IInstitutionContextValue } from "./institution-context-type";

const InstitutionContext = createContext<IInstitutionContextValue | undefined>(undefined);

export function InstitutionProvider({ children }: { children: React.ReactNode }) {
  const { loggedUser, logout } = useAuth();
  const [institutions, setInstitutions] = useState<DataInstitution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<DataInstitution | null>(null);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null);

  const storageKey = useMemo(
    () =>
      loggedUser
        ? getSelectedInstitutionStorageKey(loggedUser.environment, loggedUser.codUser)
        : null,
    [loggedUser],
  );

  const refreshInstitutions = useCallback(async () => {
    if (!loggedUser || !storageKey) {
      setInstitutions([]);
      setSelectedInstitution(null);
      setLoadedStorageKey(null);
      return;
    }

    setIsLoadingInstitutions(true);
    setErrorMessage(null);
    setSelectedInstitution(null);
    try {
      const apiClient = createApiClient(loggedUser.environment, loggedUser.jwtToken);
      const availableInstitutions = await getInstitutions(apiClient, loggedUser.codUser);
      const storedInstitutionId = await localStorage.get<number>(storageKey);
      const storedInstitution = availableInstitutions.find(
        (institution) => institution.id === storedInstitutionId,
      );
      const initialInstitution =
        availableInstitutions.length === 1 ? availableInstitutions[0] : (storedInstitution ?? null);

      setInstitutions(availableInstitutions);
      setSelectedInstitution(initialInstitution);
      if (storedInstitutionId && !storedInstitution) await localStorage.remove(storageKey);
    } catch (error) {
      if (error instanceof AppApiError && error.isAuthError) {
        await logout();
        return;
      }
      setInstitutions([]);
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível carregar as instituições",
      );
    } finally {
      setLoadedStorageKey(storageKey);
      setIsLoadingInstitutions(false);
    }
  }, [loggedUser, logout, storageKey]);

  useEffect(() => {
    void refreshInstitutions();
  }, [refreshInstitutions]);

  const selectInstitution = useCallback(
    async (institutionId: number, rememberSelection: boolean) => {
      const institution = institutions.find((item) => item.id === institutionId);
      if (!institution || !storageKey) return;

      setSelectedInstitution(institution);
      if (rememberSelection) await localStorage.set(storageKey, institutionId);
      else await localStorage.remove(storageKey);
    },
    [institutions, storageKey],
  );

  return (
    <InstitutionContext.Provider
      value={{
        institutions,
        selectedInstitution,
        isLoadingInstitutions:
          isLoadingInstitutions || Boolean(loggedUser && loadedStorageKey !== storageKey),
        errorMessage,
        selectInstitution,
        refreshInstitutions,
      }}
    >
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution(): IInstitutionContextValue {
  const context = useContext(InstitutionContext);
  if (!context) throw new Error("useInstitution deve ser usado dentro de um InstitutionProvider");
  return context;
}
