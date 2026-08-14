"use client";

import { useSession } from "@/modules/core/SessionContext";

/**
 * Central place other modules consult to know what the current plan unlocks.
 * Depending on `plans` from a feature module (wallets, goals, performance, transactions)
 * is an intentional exception — plan gating is inherently cross-cutting.
 */
export function usePlanGating() {
  const { plan } = useSession();
  const isStandard = plan === "Standard";
  return {
    plan,
    isStandard,
    walletLimitReached: (walletCount: number) => isStandard && walletCount >= 2,
    goalsLocked: isStandard,
    transactionsLocked: isStandard,
    currencyLocked: (code: string) => isStandard && code !== "USD",
    maxPeriodMonths: isStandard ? 12 : 24,
    periodLocked: (months: number) => isStandard && months > 12,
  };
}
