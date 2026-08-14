// Seed data for the Wallet/Asset tables — consumed only by prisma/seed.ts.
// Asset "price" (current market value) is NOT seeded here — it's external
// market data, see src/mocks/external/quotes.ts.

export const wallets = [
  { id: "w1", name: "Core Equity", kind: "Stocks", icon: "▤", tint: "#EEF4FF", tintFg: "#2563EB", created: "Mar 2024" },
  { id: "w2", name: "Crypto", kind: "Digital assets", icon: "◈", tint: "#F4F0FF", tintFg: "#6938EF", created: "Jul 2024" },
  { id: "w3", name: "Dividends", kind: "Income", icon: "◉", tint: "#ECFDF3", tintFg: "#067647", created: "Jan 2025" },
];

export const assets = [
  { id: "a1", walletId: "w1", ticker: "PETR4", name: "Petróleo Brasileiro PN", type: "Stock", qty: 1200, avg: 6.12 },
  { id: "a2", walletId: "w1", ticker: "VALE3", name: "Vale ON", type: "Stock", qty: 900, avg: 10.85 },
  { id: "a3", walletId: "w1", ticker: "ITUB4", name: "Itaú Unibanco PN", type: "Stock", qty: 2400, avg: 5.94 },
  { id: "a4", walletId: "w1", ticker: "WEGE3", name: "WEG ON", type: "Stock", qty: 1500, avg: 9.2 },
  { id: "a5", walletId: "w2", ticker: "BTC", name: "Bitcoin", type: "Crypto", qty: 0.42, avg: 61240 },
  { id: "a6", walletId: "w2", ticker: "ETH", name: "Ethereum", type: "Crypto", qty: 6.5, avg: 2810 },
  { id: "a7", walletId: "w2", ticker: "SOL", name: "Solana", type: "Crypto", qty: 48, avg: 178.4 },
  { id: "a8", walletId: "w3", ticker: "BBAS3", name: "Banco do Brasil ON", type: "Stock", qty: 1100, avg: 4.86 },
  { id: "a9", walletId: "w3", ticker: "TAEE11", name: "Taesa UNT", type: "Stock", qty: 700, avg: 6.4 },
  { id: "a10", walletId: "w3", ticker: "CPLE6", name: "Copel PNB", type: "Stock", qty: 1800, avg: 1.92 },
];
