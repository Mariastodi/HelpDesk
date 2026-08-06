import React from "react";
import { StatusBar } from "expo-status-bar";
import { Providers } from "@core/providers";
import { Routes } from "@core/routers";

export default function App() {
  return (
    <Providers>
      <StatusBar style="light" />
      <Routes />
    </Providers>
  );
}
