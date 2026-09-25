"use client";

import {useEffect, useState} from "react";
import {ApiResourceLoader} from "@/services/apiResourceLoader";

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
  // Guarda junto a chave (tickers) a que os dados pertencem: quando a lista de
  // tickers muda ou fica vazia, o hook devolve [] sem precisar de setState no
  // corpo do effect (regra react-hooks/set-state-in-effect).
  const [result, setResult] = useState<{ key: string; actions: CorporateAction[] }>({ key: "", actions: [] });
  const key = tickers.join(",");

  useEffect(() => {
    if (!key) return;
    let ignore = false;
    new CorporateActionsLoader(tickers)
      .load()
      .then((a) => {
        if (!ignore) setResult({ key, actions: a });
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const actions = key && result.key === key ? result.actions : [];
  return { actions };
}
