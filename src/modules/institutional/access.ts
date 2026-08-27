"use client";

import { useSession } from "@/modules/core/SessionContext";

/**
 * Central place other modules would consult to know if the institutional/ module is unlocked.
 * Mirrors src/modules/plans/gating.ts's usePlanGating, but gates on accountType (client segment)
 * instead of plan (subscription tier) — a second, independent personalization axis.
 * Depending on `useSession` from core is the same intentional exception documented for usePlanGating.
 */
export function useInstitutionalAccess() {
  const { accountType } = useSession();
  return {
    accountType,
    isInstitutional: accountType === "Institutional",
  };
}
