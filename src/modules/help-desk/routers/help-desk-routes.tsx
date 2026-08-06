import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TicketListScreen } from "@modules/help-desk/screens/ticket-list";
import { NewTicketScreen } from "@modules/help-desk/screens/new-ticket";
import { TicketDetailScreen } from "@modules/help-desk/screens/ticket-detail";
import { RootStackParamList } from "@core/routers/root-stack-type";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function HelpDeskRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TicketList" component={TicketListScreen} />
      <Stack.Screen
        name="NewTicket"
        component={NewTicketScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
    </Stack.Navigator>
  );
}
