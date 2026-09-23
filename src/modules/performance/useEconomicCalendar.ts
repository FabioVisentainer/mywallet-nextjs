"use client";

import { useEffect, useState } from "react";
import { ApiResourceLoader } from "@/services/apiResourceLoader";

export interface EconomicEvent {
  indicator: string;
  country: string;
  date: string;
  impact: "Low" | "Medium" | "High";
}

/** TEMPLATE METHOD — passos variáveis para o calendário econômico (ver ApiResourceLoader). */
class EconomicCalendarLoader extends ApiResourceLoader<EconomicEvent[]> {
  protected endpoint() {
    return "/api/market/economic-calendar";
  }
  protected extract(raw: unknown) {
    return (raw as { events: EconomicEvent[] }).events;
  }
}

/** Fetches the (mocked) external economic-calendar provider. */
export function useEconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    new EconomicCalendarLoader().load().then(setEvents).finally(() => setLoading(false));
  }, []);

  return { events, loading };
}
