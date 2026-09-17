"use client";

import { useEffect, useState } from "react";
import { ApiResourceLoader } from "@/services/apiResourceLoader";

export interface AssetReference {
  ticker: string;
  sector: string;
  country: string;
  riskRating: "Low" | "Medium" | "High";
}

/** TEMPLATE METHOD — passos variáveis para os dados de referência do ativo (ver ApiResourceLoader). */
class AssetReferenceLoader extends ApiResourceLoader<AssetReference> {
  constructor(private ticker: string) {
    super();
  }
  protected endpoint() {
    return `/api/market/asset-reference?ticker=${encodeURIComponent(this.ticker)}`;
  }
  protected extract(raw: unknown) {
    return (raw as { reference: AssetReference }).reference;
  }
}

/** Fetches the (mocked) external asset-classification/reference-data provider for a ticker. */
export function useAssetReference(ticker: string) {
  const [reference, setReference] = useState<AssetReference | null>(null);
  const trimmed = ticker.trim();

  useEffect(() => {
    if (trimmed.length < 2) return;
    let ignore = false;
    new AssetReferenceLoader(trimmed)
      .load()
      .then((r) => {
        if (!ignore) setReference(r);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [trimmed]);

  return { reference: trimmed.length >= 2 ? reference : null };
}
