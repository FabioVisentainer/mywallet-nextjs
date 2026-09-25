"use client";

import {useEffect, useState} from "react";
import {ApiResourceLoader} from "@/services/apiResourceLoader";
import type {analystCalls as AnalystCallsType} from "@/mocks/external/analystCalls";

type AnalystCall = (typeof AnalystCallsType)[number];

/** TEMPLATE METHOD — passos variáveis para o feed de recomendações (ver ApiResourceLoader). */
class AnalystCallsLoader extends ApiResourceLoader<AnalystCall[]> {
  protected endpoint() {
    return "/api/market/analyst-calls";
  }
  protected extract(raw: unknown) {
    return (raw as { calls: AnalystCall[] }).calls;
  }
}

/** Fetches the (mocked) external research/recommendations feed. */
export function useAnalystCalls() {
  const [calls, setCalls] = useState<AnalystCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    new AnalystCallsLoader().load().then(setCalls).finally(() => setLoading(false));
  }, []);

  return { calls, loading };
}
