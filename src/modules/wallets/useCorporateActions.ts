"use client";

import { useEffect, useState } from "react";
import { ApiResourceLoader } from "@/services/apiResourceLoader";

export interface CorporateAction {
  ticker: string;
  type: "Dividend" | "Split";
  exDate: string;
  amount: number;
}

/** TEMPLATE METHOD — passos variáveis para o calendário de proventos/splits (ver ApiResourceLoader). */
class CorporateActionsLoader extends ApiResourceLoader<CorporateAction[]> {
  constructor(private tickers: string[]) {
    super();
  }
  protected endpoint() {
    return `/api/market/corporate-actions?tickers=${encodeURIComponent(this.tickers.join(","))}`;
  }
  protected extract(raw: unknown) {
    return (raw as { actions: CorporateAction[] }).actions;
  }
}

/** Fetches the (mocked) external corporate-actions provider for the given tickers. */
export function useCorporateActions(tickers: string[]) {
  const [actions, setActions] = useState<CorporateAction[]>([]);
  const key = tickers.join(",");

  useEffect(() => {
    if (!key) {
      setActions([]);
      return;
    }
    let ignore = false;
    new CorporateActionsLoader(tickers)
      .load()
      .then((a) => {
        if (!ignore) setActions(a);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { actions };
}
