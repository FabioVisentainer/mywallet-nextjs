import { apiFetch } from "@/services/apiClient";
import type { TxInput, TxRecord } from "./data";

/** Service (proxy de API) do módulo transactions — única porta de saída pra /api/transactions. */
export const transactionsService = {
  list() {
    return apiFetch<{ transactions: TxRecord[] }>("/api/transactions");
  },
  create(input: TxInput) {
    return apiFetch<{ transaction: TxRecord }>("/api/transactions", { method: "POST", body: JSON.stringify(input) });
  },
  update(id: string, input: TxInput) {
    return apiFetch<{ transaction: TxRecord }>(`/api/transactions/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  },
  remove(id: string) {
    return apiFetch(`/api/transactions/${id}`, { method: "DELETE" });
  },
};
