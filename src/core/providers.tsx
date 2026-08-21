import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoaderProvider } from "@core/contexts/loader";
import { ToastProvider } from "@core/components/ui/toast";
import { AuthProvider } from "@core/contexts/auth";
import { InstitutionProvider } from "@core/contexts/institution";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <LoaderProvider>
        <ToastProvider>
          <AuthProvider>
            <InstitutionProvider>{children}</InstitutionProvider>
          </AuthProvider>
        </ToastProvider>
      </LoaderProvider>
    </SafeAreaProvider>
  );
}
