import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { colors } from "@core/theme/colors";

type ToastVariant = "error" | "warning" | "success";

interface IToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<IToastContextValue | undefined>(undefined);

const VARIANT_COLOR: Record<ToastVariant, string> = {
  error: colors.text.error,
  warning: colors.status.prazoProximo,
  success: colors.status.prazoOk,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<ToastVariant>("error");
  const opacity = useRef(new Animated.Value(0)).current;
  const activeAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const showToast = useCallback(
    (toastMessage: string, toastVariant: ToastVariant = "error") => {
      setMessage(toastMessage);
      setVariant(toastVariant);
      activeAnimation.current?.stop();
      opacity.setValue(0);

      activeAnimation.current = Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(3000),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]);
      activeAnimation.current.start(({ finished }) => {
        if (finished) setMessage(null);
      });
    },
    [opacity],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.toast, { backgroundColor: VARIANT_COLOR[variant], opacity }]}
        >
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): IToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 10,
    padding: 14,
    zIndex: 1000,
    elevation: 12,
  },
  text: {
    color: colors.text.onPrimary,
    textAlign: "center",
    fontSize: 14,
  },
});
