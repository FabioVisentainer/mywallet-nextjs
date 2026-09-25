import {apiFetch} from "@/services/apiClient";
import type {TeamMember, TeamMemberInput} from "./types";

/** Service (proxy de API) do módulo institutional — única porta de saída pra /api/team. */
export const teamService = {
  list() {
    return apiFetch<{ members: TeamMember[] }>("/api/team");
  },
  create(input: TeamMemberInput) {
    return apiFetch<{ member: TeamMember }>("/api/team", { method: "POST", body: JSON.stringify(input) });
  },
  update(id: string, input: TeamMemberInput) {
    return apiFetch<{ member: TeamMember }>(`/api/team/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  },
  remove(id: string) {
    return apiFetch(`/api/team/${id}`, { method: "DELETE" });
  },
};
