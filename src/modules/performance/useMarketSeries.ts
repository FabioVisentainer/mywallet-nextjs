"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { MarketSeries } from "./chart";

const EMPTY: MarketSeries = { months: [], series: [], benchSeries: [] };

/** Fetches the (mocked) external market-data provider's portfolio/benchmark history. */
export function useMarketSeries() {
  const [data, setData] = useState<MarketSeries>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<MarketSeries>("/api/market/performance")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { ...data, loading };
}
