"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { TxRecord } from "./data";

export function useTransactions() {
  const [transactions, setTransactions] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ transactions: TxRecord[] }>("/api/transactions")
      .then((data) => setTransactions(data.transactions))
      .finally(() => setLoading(false));
  }, []);

  return { transactions, loading };
}
