export type AssetType = "Stock" | "Crypto" | "ETF" | "REIT";

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  qty: number;
  avg: number;
  price: number;
}

export interface Wallet {
  id: string;
  name: string;
  kind: string;
  icon: string;
  tint: string;
  tintFg: string;
  created: string;
}

export interface AssetInput {
  ticker: string;
  name: string;
  type: AssetType;
  qty: string;
  avg: string;
  date: string;
}
