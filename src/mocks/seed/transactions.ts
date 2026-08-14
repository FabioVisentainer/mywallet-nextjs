// Seed data for the Transaction table — consumed only by prisma/seed.ts.

export const transactions = [
  { id: "t1", date: "2026-08-11", type: "Buy", asset: "PETR4 · Petróleo Brasileiro", wallet: "Core Equity", qty: "200", price: 7.31, total: -1462 },
  { id: "t2", date: "2026-08-07", type: "Swap", asset: "SOL → ETH", wallet: "Crypto", qty: "12.0000", price: 151.2, total: 0 },
  { id: "t3", date: "2026-08-02", type: "Sell", asset: "WEGE3 · WEG ON", wallet: "Core Equity", qty: "300", price: 8.74, total: 2622 },
  { id: "t4", date: "2026-07-28", type: "Deposit", asset: "Cash in", wallet: "Crypto", qty: "—", price: 0, total: 5000 },
  { id: "t5", date: "2026-07-21", type: "Buy", asset: "BTC · Bitcoin", wallet: "Crypto", qty: "0.0600", price: 72410, total: -4344.6 },
  { id: "t6", date: "2026-07-14", type: "Buy", asset: "ITUB4 · Itaú Unibanco", wallet: "Core Equity", qty: "400", price: 6.62, total: -2648 },
  { id: "t7", date: "2026-07-03", type: "Swap", asset: "USDC → BTC", wallet: "Crypto", qty: "3,000.00", price: 1, total: 0 },
  { id: "t8", date: "2026-06-27", type: "Sell", asset: "BBAS3 · Banco do Brasil", wallet: "Dividends", qty: "250", price: 4.63, total: 1157.5 },
  { id: "t9", date: "2026-06-19", type: "Buy", asset: "TAEE11 · Taesa UNT", wallet: "Dividends", qty: "150", price: 6.28, total: -942 },
];
