"use client";

import { useEffect, useState } from "react";
import { ApiResourceLoader } from "@/lib/apiResourceLoader";
import type { CurrencyRate } from "@/mocks/external/rates";

/** TEMPLATE METHOD — passos variáveis para o feed de câmbio (ver ApiResourceLoader). */
class CurrencyRatesLoader extends ApiResourceLoader<CurrencyRate[]> {
  protected endpoint() {
    return "/api/market/rates";
  }
  protected extract(raw: unknown) {
    return (raw as { rates: CurrencyRate[] }).rates;
  }
}

/** Fetches the (mocked) external FX-rates provider. */
export function useCurrencyRates() {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    new CurrencyRatesLoader().load().then(setRates).finally(() => setLoading(false));
  }, []);

  return { rates, loading };
}
