import { apiFetch } from "@/services/apiClient";
import type { Goal, GoalInput } from "./types";

/** Service (proxy de API) do módulo goals — única porta de saída pra /api/goals. */
export const goalsService = {
  list() {
    return apiFetch<{ goals: Goal[] }>("/api/goals");
  },
  create(input: GoalInput) {
    return apiFetch<{ goal: Goal }>("/api/goals", { method: "POST", body: JSON.stringify(input) });
  },
  update(id: string, input: GoalInput) {
    return apiFetch<{ goal: Goal }>(`/api/goals/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  },
  remove(id: string) {
    return apiFetch(`/api/goals/${id}`, { method: "DELETE" });
  },
};
