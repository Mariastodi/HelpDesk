import React, { createContext, useContext, useEffect, useState } from "react";
import { createApiClient } from "@core/services/api/client";
import { localStorage, STORAGE_KEYS } from "@core/services/storage/local-storage";
import { loginRequest } from "@modules/auth/repository/auth-repository";
import { DataLoggedUser, IAuthContextValue } from "./auth-context-type";
import { appConfig } from "@core/config/app-config";

const AuthContext = createContext<IAuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loggedUser, setLoggedUser] = useState<DataLoggedUser | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    async function restoreLoggedUserSession() {
      try {
        const storedUser = await localStorage.get<DataLoggedUser>(STORAGE_KEYS.LOGGED_USER);
        const hasValidSession =
          storedUser?.sessionExpiresAt && storedUser.sessionExpiresAt > Date.now();

        if (storedUser && hasValidSession) {
          setLoggedUser(storedUser);
        } else if (storedUser) {
          await localStorage.remove(STORAGE_KEYS.LOGGED_USER);
        }
      } finally {
        setIsRestoringSession(false);
      }
    }
    void restoreLoggedUserSession();
  }, []);

  async function login({
    username,
    password,
    environment,
  }: Parameters<IAuthContextValue["login"]>[0]) {
    const apiClient = createApiClient(environment);
    const authenticatedUser = await loginRequest(apiClient, { username, password, environment });

    const loggedUserWithExpiration = {
      ...authenticatedUser,
      sessionExpiresAt: Date.now() + appConfig.sessionDurationInMilliseconds,
    };

    await localStorage.set(STORAGE_KEYS.LOGGED_USER, loggedUserWithExpiration);
    setLoggedUser(loggedUserWithExpiration);
  }

  async function logout() {
    await localStorage.remove(STORAGE_KEYS.LOGGED_USER);
    setLoggedUser(null);
  }

  const authContextValue: IAuthContextValue = {
    loggedUser,
    isLogged: Boolean(loggedUser),
    isRestoringSession,
    login,
    logout,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): IAuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
