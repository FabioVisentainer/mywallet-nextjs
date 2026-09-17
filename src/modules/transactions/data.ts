export type TxType = "Buy" | "Sell" | "Swap" | "Deposit";

export interface TxRecord {
  id: string;
  date: string;
  type: TxType;
  asset: string;
  wallet: string;
  qty: string;
  price: number;
  total: number;
}

export const typeStyle: Record<TxType, [string, string]> = {
  Buy: ["#EEF4FF", "#2563EB"],
  Sell: ["#FEF3F2", "#B42318"],
  Swap: ["#F4F0FF", "#6938EF"],
  Deposit: ["#ECFDF3", "#067647"],
};

export interface TxInput {
  date: string;
  type: TxType;
  asset: string;
  wallet: string;
  qty: string;
  price: string;
}
