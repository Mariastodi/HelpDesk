import React, { createContext, useContext, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { colors } from "@core/theme/colors";

interface ILoaderContextValue {
  isLoading: boolean;
  loadingMessage: string | undefined;
  startLoading: (message?: string) => void;
  endLoading: () => void;
}

const LoaderContext = createContext<ILoaderContextValue | undefined>(undefined);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>();

  function startLoading(message?: string) {
    setLoadingMessage(message);
    setIsLoading(true);
  }

  function endLoading() {
    setIsLoading(false);
    setLoadingMessage(undefined);
  }

  return (
    <LoaderContext.Provider value={{ isLoading, loadingMessage, startLoading, endLoading }}>
      {children}
      <Modal transparent visible={isLoading} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
            {loadingMessage ? <Text style={styles.message}>{loadingMessage}</Text> : null}
          </View>
        </View>
      </Modal>
    </LoaderContext.Provider>
  );
}

export function useLoading(): ILoaderContextValue {
  const loaderContext = useContext(LoaderContext);
  if (!loaderContext) {
    throw new Error("useLoading deve ser usado dentro de um LoaderProvider");
  }
  return loaderContext;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.background.screen,
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 12,
    minWidth: 160,
  },
  message: {
    marginTop: 12,
    color: colors.text.primary,
    textAlign: "center",
  },
});
