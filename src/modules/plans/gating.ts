"use client";

import { useSession } from "@/modules/core/SessionContext";
import type { PlanName } from "@/modules/core/types";

/**
 * STRATEGY — exemplo 1 de 3.
 *
 * cada plano de assinatura (Standard/Platinum/Black) é uma implementação
 * intercambiável da mesma interface `PlanPolicy`. Em vez de um `isStandard ? a : b`
 * central que só sabe distinguir "Standard" de "não-Standard", cada plano decide,
 * de forma isolada, o que libera.
 *
 * Por quê: a versão anterior comparava só `plan === "Standard"`, então Platinum e
 * Black eram tratados como idênticos o que já deixa de ser verdade no dia em que
 * um recurso exclusivo do Black (relatórios, recomendações de analista) precisar de
 * checagem própria. Com uma classe por plano, adicionar essa regra é só sobrescrever
 * um método na classe `BlackPlanPolicy`, sem tocar nas outras nem no hook que as usa.
 */
export interface PlanPolicy {
  readonly walletLimit: number | null; // null = sem limite
  readonly goalsLocked: boolean;
  readonly transactionsLocked: boolean;
  readonly maxPeriodMonths: number;
  isCurrencyLocked(code: string): boolean;
}

/** Estratégia concreta 1/3 — plano gratuito, o mais restritivo. */
class StandardPlanPolicy implements PlanPolicy {
  readonly walletLimit = 2;
  readonly goalsLocked = true;
  readonly transactionsLocked = true;
  readonly maxPeriodMonths = 12;
  isCurrencyLocked(code: string) {
    return code !== "USD";
  }
}

/** Estratégia concreta 2/3 — libera carteiras, moedas, período completo e metas. */
class PlatinumPlanPolicy implements PlanPolicy {
  readonly walletLimit = null;
  readonly goalsLocked = false;
  readonly transactionsLocked = false;
  readonly maxPeriodMonths = 24;
  isCurrencyLocked() {
    return false;
  }
}

/** Estratégia concreta 3/3 — tudo do Platinum; ponto certo para futuras regras exclusivas do Black. */
class BlackPlanPolicy extends PlatinumPlanPolicy {}

const POLICIES: Record<PlanName, PlanPolicy> = {
  Standard: new StandardPlanPolicy(),
  Platinum: new PlatinumPlanPolicy(),
  Black: new BlackPlanPolicy(),
};

/**
 * Central place other modules consult to know what the current plan unlocks.
 * Depending on `plans` from a feature module (wallets, goals, performance, transactions)
 * is an intentional exception — plan gating is inherently cross-cutting.
 */
export function usePlanGating() {
  const { plan } = useSession();
  const policy = POLICIES[plan];
  const isStandard = plan === "Standard";
  return {
    plan,
    isStandard,
    walletLimitReached: (walletCount: number) => policy.walletLimit !== null && walletCount >= policy.walletLimit,
    goalsLocked: policy.goalsLocked,
    transactionsLocked: policy.transactionsLocked,
    currencyLocked: (code: string) => policy.isCurrencyLocked(code),
    maxPeriodMonths: policy.maxPeriodMonths,
    periodLocked: (months: number) => months > policy.maxPeriodMonths,
  };
}
