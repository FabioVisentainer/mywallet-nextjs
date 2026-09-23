// Simulates a third-party economic-calendar provider (macro events/indicators
// relevant to the markets the user is exposed to). Swap this module for a
// real fetch() to an economic-calendar API without touching callers.

export interface EconomicEvent {
  indicator: string;
  country: string;
  date: string;
  impact: "Low" | "Medium" | "High";
}

export const economicEvents: EconomicEvent[] = [
  { indicator: "Selic rate decision", country: "BR", date: "2026-10-16", impact: "High" },
  { indicator: "CPI (YoY)", country: "US", date: "2026-10-10", impact: "High" },
  { indicator: "Nonfarm payrolls", country: "US", date: "2026-10-03", impact: "Medium" },
  { indicator: "GDP (QoQ)", country: "BR", date: "2026-10-29", impact: "Medium" },
  { indicator: "IPCA-15", country: "BR", date: "2026-10-24", impact: "Low" },
];
