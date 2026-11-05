import { Platform } from "react-native";
import { RiskEvent } from "../types";

let enabled = false;
export async function enableNotifications(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const Notifications = await import("expo-notifications");
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("risk-alerts", {
      name: "Alertas urbanos",
      importance: Notifications.AndroidImportance.HIGH,
    });
  const permission = await Notifications.requestPermissionsAsync();
  enabled = permission.granted;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  return enabled;
}
export async function notifyEvent(event: RiskEvent) {
  if (!enabled || Platform.OS === "web") return;
  const Notifications = await import("expo-notifications");
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Alerta em ${event.neighborhood}`,
      body: event.title,
      data: { eventId: event.id },
    },
    trigger: null,
  });
}
