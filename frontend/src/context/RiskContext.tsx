import React, { createContext, useContext } from "react";
import { useRiskFeed } from "../hooks/useRiskFeed";

const RiskContext = createContext<ReturnType<typeof useRiskFeed> | null>(null);
export function RiskProvider({ children }: React.PropsWithChildren) {
  const feed = useRiskFeed();
  return <RiskContext.Provider value={feed}>{children}</RiskContext.Provider>;
}
export function useRiskContext() {
  const feed = useContext(RiskContext);
  if (!feed) throw new Error("RiskProvider is required");
  return feed;
}
