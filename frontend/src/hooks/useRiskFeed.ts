import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadSnapshot } from "../services/api";
import { notifyEvent } from "../services/notifications";
import { RiskEvent, Snapshot } from "../types";

const CACHE_KEY = "urbanrisk:snapshot:v1";
export function useRiskFeed() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState<"loading" | "online" | "offline">(
    "loading",
  );
  const [latency, setLatency] = useState(0);
  const [alerts, setAlerts] = useState<RiskEvent[]>([]);
  const [reconnected, setReconnected] = useState(false);
  const running = useRef(false);
  const mounted = useRef(true);
  const known = useRef<Set<number> | null>(null);
  const wasOffline = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    if (running.current || !mounted.current) return;
    running.current = true;
    controller.current = new AbortController();
    const started = Date.now();
    try {
      const next = await loadSnapshot(controller.current.signal);
      if (!mounted.current) return;
      const incoming = known.current
        ? next.events.filter(
            (e) =>
              !known.current!.has(e.id) &&
              e.analysis.score >= 60 &&
              e.status !== "RESOLVED",
          )
        : [];
      if (incoming.length) {
        setAlerts((previous) => [...incoming, ...previous].slice(0, 100));
        incoming.forEach((e) => {
          void notifyEvent(e).catch(() => undefined);
        });
      }
      known.current = new Set(next.events.map((e) => e.id));
      setSnapshot(next);
      setLatency(Date.now() - started);
      setStatus("online");
      if (wasOffline.current) setReconnected(true);
      wasOffline.current = false;
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next)).catch(
        () => undefined,
      );
    } catch {
      if (mounted.current) {
        setStatus("offline");
        wasOffline.current = true;
      }
    } finally {
      running.current = false;
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    let interval: ReturnType<typeof setInterval>;
    void (async () => {
      const cached = await AsyncStorage.getItem(CACHE_KEY).catch(() => null);
      if (!mounted.current) return;
      if (cached) {
        try {
          const data = JSON.parse(cached) as Snapshot;
          if (Array.isArray(data.events) && data.metrics && data.syncedAt) {
            setSnapshot(data);
            known.current = new Set(data.events.map((e) => e.id));
          }
        } catch {
          /* Invalid cache is discarded. */
        }
      }
      await refresh();
      if (mounted.current)
        interval = setInterval(() => {
          if (
            AppState.currentState === "active" ||
            AppState.currentState == null
          )
            void refresh();
        }, 5000);
    })();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => {
      mounted.current = false;
      clearInterval(interval);
      subscription.remove();
      controller.current?.abort();
    };
  }, [refresh]);
  useEffect(() => {
    if (!reconnected) return;
    const timer = setTimeout(() => setReconnected(false), 7000);
    return () => clearTimeout(timer);
  }, [reconnected]);
  return {
    snapshot,
    status,
    latency,
    alerts,
    refresh,
    reconnected,
    clearAlerts: () => setAlerts([]),
  };
}
