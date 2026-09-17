"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { TxInput, TxRecord } from "./data";

export function useTransactions() {
  const [transactions, setTransactions] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    return apiFetch<{ transactions: TxRecord[] }>("/api/transactions").then((data) => setTransactions(data.transactions));
  }, []);

  useEffect(() => {
    refetch().finally(() => setLoading(false));
  }, [refetch]);

  const addTransaction = useCallback(async (input: TxInput) => {
    const { transaction } = await apiFetch<{ transaction: TxRecord }>("/api/transactions", { method: "POST", body: JSON.stringify(input) });
    setTransactions((ts) => [transaction, ...ts]);
  }, []);

  const updateTransaction = useCallback(async (id: string, input: TxInput) => {
    const { transaction } = await apiFetch<{ transaction: TxRecord }>(`/api/transactions/${id}`, { method: "PATCH", body: JSON.stringify(input) });
    setTransactions((ts) => ts.map((t) => (t.id === id ? transaction : t)));
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await apiFetch(`/api/transactions/${id}`, { method: "DELETE" });
    setTransactions((ts) => ts.filter((t) => t.id !== id));
  }, []);

  return { transactions, loading, refetch, addTransaction, updateTransaction, deleteTransaction };
}
