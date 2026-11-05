export type RiskType = "FLOOD" | "HEAT" | "SERVICE";
export type Level = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Source = "SENSOR" | "PUBLIC_DATA" | "COMMUNITY";
export interface RiskEvent {
  id: number;
  title: string;
  description: string;
  type: RiskType;
  source: Source;
  sourceName: string;
  severity: Level;
  status: "ACTIVE" | "MONITORING" | "RESOLVED";
  neighborhood: string;
  affectedPeople: number;
  latitude: number;
  longitude: number;
  confidence: number;
  simulated: boolean;
  measuredValue: number | null;
  unit: string | null;
  observedAt: string;
  createdAt: string;
  analysis: {
    score: number;
    level: Level;
    reasons: string[];
    recommendation: string;
  };
}
export interface EventPage {
  items: RiskEvent[];
  total: number;
  page: number;
  size: number;
  serverTime: string;
}
export interface Metrics {
  active: number;
  critical: number;
  averageConfidence: number;
  total: number;
  byType: Record<RiskType, number>;
  pollIntervalSeconds: number;
  serverTime: string;
}
export interface Snapshot {
  events: RiskEvent[];
  metrics: Metrics;
  syncedAt: string;
  demoEnabled: boolean;
}
export const typeLabels: Record<RiskType, string> = {
  FLOOD: "Alagamentos",
  HEAT: "Ilhas de calor",
  SERVICE: "Serviços essenciais",
};
export const levelLabels: Record<Level, string> = {
  LOW: "Baixo",
  MEDIUM: "Moderado",
  HIGH: "Alto",
  CRITICAL: "Crítico",
};
export const sourceLabels: Record<Source, string> = {
  SENSOR: "Sensor",
  PUBLIC_DATA: "Base pública",
  COMMUNITY: "Comunidade",
};
