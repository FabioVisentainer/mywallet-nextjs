// Simulates a third-party asset-classification/reference-data provider
// (sector, country of listing, risk rating per ticker). Swap this module
// for a real fetch() to a reference-data API without touching callers.

export interface AssetReference {
  ticker: string;
  sector: string;
  country: string;
  riskRating: "Low" | "Medium" | "High";
}

const references: Record<string, AssetReference> = {
  PETR4: { ticker: "PETR4", sector: "Energy", country: "Brazil", riskRating: "Medium" },
  VALE3: { ticker: "VALE3", sector: "Materials", country: "Brazil", riskRating: "Medium" },
  ITUB4: { ticker: "ITUB4", sector: "Financials", country: "Brazil", riskRating: "Low" },
  WEGE3: { ticker: "WEGE3", sector: "Industrials", country: "Brazil", riskRating: "Low" },
  BBAS3: { ticker: "BBAS3", sector: "Financials", country: "Brazil", riskRating: "Low" },
  TAEE11: { ticker: "TAEE11", sector: "Utilities", country: "Brazil", riskRating: "Low" },
  CPLE6: { ticker: "CPLE6", sector: "Utilities", country: "Brazil", riskRating: "Low" },
  BTC: { ticker: "BTC", sector: "Crypto", country: "Global", riskRating: "High" },
  ETH: { ticker: "ETH", sector: "Crypto", country: "Global", riskRating: "High" },
  SOL: { ticker: "SOL", sector: "Crypto", country: "Global", riskRating: "High" },
};

/** Reference/classification data for a ticker. Unrecognized tickers get a generic, unrated entry. */
export function getAssetReference(ticker: string): AssetReference {
  return references[ticker.toUpperCase()] ?? { ticker: ticker.toUpperCase(), sector: "Unclassified", country: "Unknown", riskRating: "Medium" };
}
