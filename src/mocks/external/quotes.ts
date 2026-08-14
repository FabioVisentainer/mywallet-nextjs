// Simulates a third-party market-data provider (current price per ticker).
// Swap this module for a real fetch() to a quotes API without touching callers.

const quotes: Record<string, number> = {
  PETR4: 7.34,
  VALE3: 11.42,
  ITUB4: 6.88,
  WEGE3: 8.71,
  BTC: 74310.5,
  ETH: 3402.75,
  SOL: 151.2,
  BBAS3: 4.52,
  TAEE11: 6.71,
  CPLE6: 2.11,
};

/** Current market price for a ticker. Unknown tickers get a small synthetic markup over cost, as if freshly quoted. */
export function getQuote(ticker: string, avgCost: number): number {
  return quotes[ticker.toUpperCase()] ?? avgCost * 1.012;
}
