"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ActivityEntry, ManagedUser, UserPermissions, UserRole } from "./types";
import { apiFetch } from "@/lib/apiClient";

function defaultPerms(role: UserRole): UserPermissions {
  return {
    view: true,
    wallets: role !== "Analyst",
    publish: role === "Analyst" || role === "Administrator",
    moderate: role === "Administrator",
    admin: role === "Administrator",
  };
}

interface AdminContextValue {
  users: ManagedUser[];
  loading: boolean;
  getUser: (id: string) => ManagedUser | undefined;
  getActivity: (userId: string) => Promise<ActivityEntry[]>;
  getPermissions: (userId: string) => UserPermissions;
  togglePermission: (userId: string, key: keyof UserPermissions, on: boolean) => void;
  changeRole: (userId: string, role: UserRole) => Promise<void>;
  revokePublishing: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [perms, setPerms] = useState<Record<string, UserPermissions>>({});

  useEffect(() => {
    apiFetch<{ users: ManagedUser[] }>("/api/users")
      .then((data) => setUsers(data.users))
      .finally(() => setLoading(false));
  }, []);

  const getUser = useCallback((id: string) => users.find((u) => u.id === id), [users]);

  const getActivity = useCallback(async (userId: string) => {
    const data = await apiFetch<{ activity: ActivityEntry[] }>(`/api/users/${userId}`);
    return data.activity;
  }, []);

  const getPermissions = useCallback(
    (userId: string) => {
      if (perms[userId]) return perms[userId];
      const user = users.find((u) => u.id === userId);
      return defaultPerms(user ? user.role : "Investor");
    },
    [perms, users]
  );

  const togglePermission = useCallback(
    (userId: string, key: keyof UserPermissions, on: boolean) => {
      setPerms((p) => {
        const current = p[userId] || defaultPerms(users.find((u) => u.id === userId)?.role || "Investor");
        return { ...p, [userId]: { ...current, [key]: on } };
      });
    },
    [users]
  );

  const changeRole = useCallback(async (userId: string, role: UserRole) => {
    const { user } = await apiFetch<{ user: ManagedUser }>(`/api/users/${userId}`, { method: "PATCH", body: JSON.stringify({ role }) });
    setUsers((us) => us.map((u) => (u.id === userId ? user : u)));
  }, []);

  const revokePublishing = useCallback(async (userId: string) => {
    const { user } = await apiFetch<{ user: ManagedUser }>(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role: "Investor", perms: "Wallets, goals, market data" }),
    });
    setUsers((us) => us.map((u) => (u.id === userId ? user : u)));
    setPerms((p) => ({ ...p, [userId]: { ...(p[userId] || defaultPerms("Analyst")), publish: false } }));
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    await apiFetch(`/api/users/${userId}`, { method: "DELETE" });
    setUsers((us) => us.filter((u) => u.id !== userId));
  }, []);

  const value = useMemo<AdminContextValue>(
    () => ({ users, loading, getUser, getActivity, getPermissions, togglePermission, changeRole, revokePublishing, deleteUser }),
    [users, loading, getUser, getActivity, getPermissions, togglePermission, changeRole, revokePublishing, deleteUser]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
