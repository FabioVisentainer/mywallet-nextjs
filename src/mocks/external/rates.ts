// Simulates a third-party foreign-exchange rates provider.
// Swap this module for a real fetch() to an FX API without touching callers.

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export const currencyRates: CurrencyRate[] = [
  { code: "USD", name: "US dollar", symbol: "$", rate: 1 },
  { code: "EUR", name: "Euro", symbol: "€", rate: 0.92 },
  { code: "GBP", name: "British pound", symbol: "£", rate: 0.79 },
  { code: "CAD", name: "Canadian dollar", symbol: "C$", rate: 1.36 },
];
