// Simulates a third-party research/recommendations feed shown on the public news page.
// Swap this module for a real fetch() to a research-vendor API without touching callers.

export const analystCalls = [
  { ticker: "PETR4", target: "$8.40", rating: "Buy", bg: "#063E27", fg: "#75E0A7" },
  { ticker: "WEGE3", target: "$8.90", rating: "Hold", bg: "#4E2A05", fg: "#FEC84B" },
  { ticker: "SOL", target: "$120.00", rating: "Sell", bg: "#55160C", fg: "#FDA29B" },
];
