import { Platform } from "react-native";
import { EventPage, Metrics, RiskEvent, Snapshot } from "../types";
import { requestJson } from "./http";

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080")
).replace(/\/$/, "");
export async function request<T>(
  path: string,
  options: RequestInit = {},
  signal?: AbortSignal,
): Promise<T> {
  return requestJson<T>(`${API_URL}${path}`, options, signal);
}
export async function loadSnapshot(signal?: AbortSignal): Promise<Snapshot> {
  const [first, metrics] = await Promise.all([
    request<EventPage>("/api/events?size=100", {}, signal),
    request<Metrics>("/api/dashboard", {}, signal),
  ]);
  const remaining = Math.min(10, Math.ceil(first.total / 100));
  const pages = await Promise.all(
    Array.from({ length: Math.max(0, remaining - 1) }, (_, i) =>
      request<EventPage>(`/api/events?size=100&page=${i + 1}`, {}, signal),
    ),
  );
  const demo = await request<{ enabled: boolean }>(
    "/api/demo/status",
    {},
    signal,
  ).catch(() => ({ enabled: false }));
  return {
    events: [...first.items, ...pages.flatMap((p) => p.items)],
    metrics,
    syncedAt: new Date().toISOString(),
    demoEnabled: demo.enabled,
  };
}
export const createReport = (body: Record<string, unknown>) =>
  request<RiskEvent>("/api/events", {
    method: "POST",
    body: JSON.stringify(body),
  });
export const simulateReading = () =>
  request<RiskEvent>("/api/demo/reading", { method: "POST" });
export const getEvent = (id: number) => request<RiskEvent>(`/api/events/${id}`);
