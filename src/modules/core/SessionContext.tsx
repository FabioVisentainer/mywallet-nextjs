"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/apiClient";
import { initials as computeInitials } from "./format";
import type { PlanName, Role } from "./types";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: NonNullable<Role>;
  initials: string;
  roleLabel: string;
}

const ROLE_LABEL: Record<NonNullable<Role>, string> = {
  investor: "Investor",
  analyst: "Certified analyst",
  admin: "Administrator",
};

/** Maps the DB's role string ("Investor" | "Analyst" | "Administrator") to the app's internal Role. */
function toAppRole(dbRole: string): NonNullable<Role> {
  if (dbRole === "Analyst") return "analyst";
  if (dbRole === "Administrator") return "admin";
  return "investor";
}

interface LoginResult {
  user: { id: string; name: string; email: string; role: string };
}

interface SessionContextValue {
  role: Role;
  plan: PlanName;
  user: SessionUser | null;
  login: (email: string, password: string) => Promise<SessionUser>;
  logout: () => void;
  setPlan: (plan: PlanName) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [plan, setPlan] = useState<PlanName>("Platinum");

  const login = useCallback(async (email: string, password: string) => {
    const { user: dbUser } = await apiFetch<LoginResult>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const role = toAppRole(dbUser.role);
    const sessionUser: SessionUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role,
      initials: computeInitials(dbUser.name),
      roleLabel: ROLE_LABEL[role],
    };
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo<SessionContextValue>(
    () => ({
      role: user?.role ?? null,
      plan,
      user,
      login,
      logout,
      setPlan,
    }),
    [user, plan, login, logout]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
