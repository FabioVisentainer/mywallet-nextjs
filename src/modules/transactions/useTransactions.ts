"use client";

import {useCallback, useEffect, useState} from "react";
import {transactionsService} from "./transactionsService";
import type {TxInput, TxRecord} from "./data";

export function useTransactions() {
  const [transactions, setTransactions] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    return transactionsService.list().then((data) => setTransactions(data.transactions));
  }, []);

  useEffect(() => {
    refetch().finally(() => setLoading(false));
  }, [refetch]);

  const addTransaction = useCallback(async (input: TxInput) => {
    const { transaction } = await transactionsService.create(input);
    setTransactions((ts) => [transaction, ...ts]);
  }, []);

  const updateTransaction = useCallback(async (id: string, input: TxInput) => {
    const { transaction } = await transactionsService.update(id, input);
    setTransactions((ts) => ts.map((t) => (t.id === id ? transaction : t)));
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await transactionsService.remove(id);
    setTransactions((ts) => ts.filter((t) => t.id !== id));
  }, []);

  return { transactions, loading, refetch, addTransaction, updateTransaction, deleteTransaction };
}
