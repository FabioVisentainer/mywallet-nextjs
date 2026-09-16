// Simulates a third-party crypto exchange's swap/trade-history API (Req. 16:
// "operações de swap realizadas em corretoras"). The app only reads this feed —
// it does not own or maintain these records. Swap this module for a real
// fetch() to an exchange API without touching callers.

export interface BrokerSwap {
  id: string;
  exchange: string;
  fromTicker: string;
  toTicker: string;
  fromQty: number;
  toQty: number;
  executedAt: string;
}

export const brokerSwaps: BrokerSwap[] = [
  { id: "bs1", exchange: "Binance", fromTicker: "BTC", toTicker: "ETH", fromQty: 0.05, toQty: 1.12, executedAt: "2026-08-02" },
  { id: "bs2", exchange: "Binance", fromTicker: "ETH", toTicker: "SOL", fromQty: 0.8, toQty: 18.4, executedAt: "2026-08-19" },
  { id: "bs3", exchange: "Coinbase", fromTicker: "SOL", toTicker: "BTC", fromQty: 25, toQty: 0.032, executedAt: "2026-09-03" },
];

/** Swaps reported by external exchanges that have not yet been imported into a given wallet's ledger. */
export function getPendingBrokerSwaps(importedIds: string[]): BrokerSwap[] {
  return brokerSwaps.filter((s) => !importedIds.includes(s.id));
}

/** Looks up a single swap reported by the external feed, by its id. */
export function getBrokerSwapById(id: string): BrokerSwap | undefined {
  return brokerSwaps.find((s) => s.id === id);
}
