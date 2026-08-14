"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { analystCalls as AnalystCallsType } from "@/mocks/external/analystCalls";

type AnalystCall = (typeof AnalystCallsType)[number];

/** Fetches the (mocked) external research/recommendations feed. */
export function useAnalystCalls() {
  const [calls, setCalls] = useState<AnalystCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ calls: AnalystCall[] }>("/api/market/analyst-calls")
      .then((data) => setCalls(data.calls))
      .finally(() => setLoading(false));
  }, []);

  return { calls, loading };
}
