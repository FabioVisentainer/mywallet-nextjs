"use client";

import {useEffect, useState} from "react";
import {AssetReferenceLoader, type AssetReference} from "./useAssetReference";

/**
 * Busca os dados de referência (setor, país, risco) de vários tickers de uma vez,
 * no provedor externo simulado (mocks/external/assetReference.ts). Reaproveita o
 * AssetReferenceLoader (Template Method) do hook de um ticker só.
 */
export function useAssetReferences(tickers: string[]) {
  // Mesmo cuidado do useCorporateActions: guarda a chave dos tickers junto com os
  // dados, para não chamar setState no corpo do effect quando a lista muda.
  const [result, setResult] = useState<{ key: string; refs: Record<string, AssetReference> }>({ key: "", refs: {} });
  const key = Array.from(new Set(tickers.map((t) => t.trim().toUpperCase()).filter(Boolean)))
    .sort()
    .join(",");

  useEffect(() => {
    if (!key) return;
    let ignore = false;
    Promise.all(key.split(",").map((t) => new AssetReferenceLoader(t).load()))
      .then((list) => {
        if (!ignore) setResult({ key, refs: Object.fromEntries(list.map((r) => [r.ticker.toUpperCase(), r])) });
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [key]);

  const references: Record<string, AssetReference> = key && result.key === key ? result.refs : {};
  return { references };
}
