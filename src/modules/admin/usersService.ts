import { apiFetch } from "@/services/apiClient";
import type { ActivityEntry, ManagedUser, ManagedUserInput } from "./types";

/** Service (proxy de API) do módulo admin — única porta de saída pra /api/users. */
export const usersService = {
  list() {
    return apiFetch<{ users: ManagedUser[] }>("/api/users");
  },
  create(input: ManagedUserInput) {
    return apiFetch<{ user: ManagedUser }>("/api/users", { method: "POST", body: JSON.stringify(input) });
  },
  getActivity(userId: string) {
    return apiFetch<{ activity: ActivityEntry[] }>(`/api/users/${userId}`);
  },
  update(userId: string, patch: Partial<{ role: string; status: string; perms: string }>) {
    return apiFetch<{ user: ManagedUser }>(`/api/users/${userId}`, { method: "PATCH", body: JSON.stringify(patch) });
  },
  remove(userId: string) {
    return apiFetch(`/api/users/${userId}`, { method: "DELETE" });
  },
};
