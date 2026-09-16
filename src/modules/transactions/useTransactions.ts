"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { TxRecord } from "./data";

export function useTransactions() {
  const [transactions, setTransactions] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    return apiFetch<{ transactions: TxRecord[] }>("/api/transactions").then((data) => setTransactions(data.transactions));
  }, []);

  useEffect(() => {
    refetch().finally(() => setLoading(false));
  }, [refetch]);

  return { transactions, loading, refetch };
}
