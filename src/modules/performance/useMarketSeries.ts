"use client";

import { useEffect, useState } from "react";
import { ApiResourceLoader } from "@/services/apiResourceLoader";
import type { MarketSeries } from "./chart";

const EMPTY: MarketSeries = { months: [], series: [], benchSeries: [] };

/** TEMPLATE METHOD: preenche os passos do ApiResourceLoader para buscar o histórico de performance. */
class MarketSeriesLoader extends ApiResourceLoader<MarketSeries> {
  protected endpoint() {
    return "/api/market/performance";
  }
  protected extract(raw: unknown) {
    return raw as MarketSeries;
  }
}

/** Fetches the (mocked) external market-data provider's portfolio/benchmark history. */
export function useMarketSeries() {
  const [data, setData] = useState<MarketSeries>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    new MarketSeriesLoader().load().then(setData).finally(() => setLoading(false));
  }, []);

  return { ...data, loading };
}
