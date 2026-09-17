import { apiFetch } from "@/services/apiClient";
import type { Promotion, PromotionInput } from "./types";

/** Service (proxy de API) do módulo promotions — única porta de saída pra /api/promotions. */
export const promotionsService = {
  list() {
    return apiFetch<{ promotions: Promotion[] }>("/api/promotions");
  },
  create(input: PromotionInput, createdBy: string) {
    return apiFetch<{ promotion: Promotion }>("/api/promotions", { method: "POST", body: JSON.stringify({ ...input, createdBy }) });
  },
  update(id: string, input: Omit<PromotionInput, "discountPct"> & { discountPct: PromotionInput["discountPct"] | number; active?: boolean }) {
    return apiFetch<{ promotion: Promotion }>(`/api/promotions/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  },
  remove(id: string) {
    return apiFetch(`/api/promotions/${id}`, { method: "DELETE" });
  },
};
