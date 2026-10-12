"use client";

import {useSession} from "@/modules/core/SessionContext";
import type {PlanName} from "@/modules/core/types";

/**
 * STRATEGY (exemplo 1 de 3)
 *
 * Cada plano de assinatura (Standard, Platinum e Black) é uma classe que segue
 * a mesma interface PlanPolicy. Cada plano decide sozinho o que libera, em vez
 * de um isStandard ? a : b central que só sabe diferenciar o Standard do resto.
 *
 * Por que existe: a versão anterior comparava só plan === "Standard", então
 * Platinum e Black eram tratados como iguais. Isso deixa de funcionar no dia em
 * que o Black ganhar algo exclusivo, como relatórios ou recomendações de
 * analistas. Com uma classe por plano, basta sobrescrever um método na
 * BlackPlanPolicy, sem mexer nos outros planos nem no hook que usa as classes.
 */
export interface PlanPolicy {
  readonly walletLimit: number | null; // null = sem limite
  readonly goalsLocked: boolean;
  readonly transactionsLocked: boolean;
  readonly maxPeriodMonths: number;
  readonly analystCallsLocked: boolean;
  isCurrencyLocked(code: string): boolean;
}

/** Estratégia 1 de 3: plano gratuito, o mais restrito. */
class StandardPlanPolicy implements PlanPolicy {
  readonly walletLimit = 2;
  readonly goalsLocked = true;
  readonly transactionsLocked = true;
  readonly maxPeriodMonths = 12;
  readonly analystCallsLocked = true;
  isCurrencyLocked(code: string) {
    return code !== "USD";
  }
}

/** Estratégia 2 de 3: libera carteiras ilimitadas, todas as moedas, 24 meses de histórico, metas e transações. */
class PlatinumPlanPolicy implements PlanPolicy {
  readonly walletLimit = null;
  readonly goalsLocked = false;
  readonly transactionsLocked = false;
  readonly maxPeriodMonths = 24;
  readonly analystCallsLocked: boolean = true;
  isCurrencyLocked() {
    return false;
  }
}

/** Estratégia 3 de 3: tem tudo do Platinum e ainda libera as recomendações de analistas, que são exclusivas do Black. */
class BlackPlanPolicy extends PlatinumPlanPolicy {
  readonly analystCallsLocked = false;
}

const POLICIES: Record<PlanName, PlanPolicy> = {
  Standard: new StandardPlanPolicy(),
  Platinum: new PlatinumPlanPolicy(),
  Black: new BlackPlanPolicy(),
};

/**
 * Contexto do Strategy: pega o plano da sessão, escolhe a estratégia certa e
 * devolve para as telas o que está liberado. Os módulos de carteiras, metas,
 * performance e transações dependem daqui de propósito, porque a regra de
 * plano vale para o app inteiro.
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
    analystCallsLocked: policy.analystCallsLocked,
  };
}
