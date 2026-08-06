import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { EnvironmentSelectionScreen } from "@modules/auth/screens/environment-selection";
import { LoginScreen } from "@modules/auth/screens/login";
import { RootStackParamList } from "@core/routers/root-stack-type";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AuthRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EnvironmentSelection" component={EnvironmentSelectionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
