"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { CurrencyRate } from "@/mocks/external/rates";

/** Fetches the (mocked) external FX-rates provider. */
export function useCurrencyRates() {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ rates: CurrencyRate[] }>("/api/market/rates")
      .then((data) => setRates(data.rates))
      .finally(() => setLoading(false));
  }, []);

  return { rates, loading };
}
