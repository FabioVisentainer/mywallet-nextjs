// Simulates a third-party corporate-actions provider (upcoming dividends and
// stock splits per ticker). Swap this module for a real fetch() to a
// corporate-actions API without touching callers.

export interface CorporateAction {
  ticker: string;
  type: "Dividend" | "Split";
  exDate: string;
  amount: number;
}

const actions: CorporateAction[] = [
  { ticker: "PETR4", type: "Dividend", exDate: "2026-10-15", amount: 0.42 },
  { ticker: "VALE3", type: "Dividend", exDate: "2026-10-08", amount: 0.65 },
  { ticker: "ITUB4", type: "Dividend", exDate: "2026-11-02", amount: 0.18 },
  { ticker: "WEGE3", type: "Split", exDate: "2026-09-30", amount: 2 },
  { ticker: "BBAS3", type: "Dividend", exDate: "2026-10-22", amount: 0.31 },
  { ticker: "TAEE11", type: "Dividend", exDate: "2026-10-29", amount: 0.27 },
];

/** Upcoming dividends/splits reported by the external provider for the given tickers. */
export function getUpcomingActions(tickers: string[]): CorporateAction[] {
  const set = new Set(tickers.map((t) => t.toUpperCase()));
  return actions.filter((a) => set.has(a.ticker));
}
