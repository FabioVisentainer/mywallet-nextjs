"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { TeamMember, TeamMemberInput } from "./types";
import { apiFetch } from "@/lib/apiClient";

interface TeamContextValue {
  members: TeamMember[];
  loading: boolean;
  addMember: (input: TeamMemberInput) => Promise<void>;
  updateMember: (id: string, input: TeamMemberInput) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ members: TeamMember[] }>("/api/team")
      .then((data) => setMembers(data.members))
      .finally(() => setLoading(false));
  }, []);

  const addMember = useCallback(async (input: TeamMemberInput) => {
    const { member } = await apiFetch<{ member: TeamMember }>("/api/team", { method: "POST", body: JSON.stringify(input) });
    setMembers((ms) => ms.concat([member]));
  }, []);

  const updateMember = useCallback(async (id: string, input: TeamMemberInput) => {
    const { member } = await apiFetch<{ member: TeamMember }>(`/api/team/${id}`, { method: "PATCH", body: JSON.stringify(input) });
    setMembers((ms) => ms.map((m) => (m.id === id ? member : m)));
  }, []);

  const removeMember = useCallback(async (id: string) => {
    await apiFetch(`/api/team/${id}`, { method: "DELETE" });
    setMembers((ms) => ms.filter((m) => m.id !== id));
  }, []);

  const value = useMemo<TeamContextValue>(
    () => ({ members, loading, addMember, updateMember, removeMember }),
    [members, loading, addMember, updateMember, removeMember]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam(): TeamContextValue {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within TeamProvider");
  return ctx;
}
