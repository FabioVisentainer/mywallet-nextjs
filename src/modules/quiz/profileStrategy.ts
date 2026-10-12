import {type InvestorProfile, profiles} from "./data";

type ProfileKey = "Conservative" | "Moderate" | "Aggressive";

/**
 * STRATEGY (exemplo 2 de 3)
 *
 * Decide qual perfil de investidor (Conservative, Moderate ou Aggressive) o
 * resultado do teste indica, a partir da nota de 0 a 100.
 *
 * Por que existe: a regra era um ternário encadeado dentro do useMemo do
 * QuizContext (s < 40 ? Conservative : s < 70 ? Moderate : Aggressive). Agora
 * cada faixa de nota é uma classe própria. Para criar um quarto perfil, basta
 * criar uma nova estratégia e colocar na lista, sem mexer nas outras. É um caso
 * diferente do Strategy de planos (gating.ts): aqui a variação é como
 * classificar uma nota, e não o que uma assinatura libera.
 */
export interface InvestorProfileStrategy {
  readonly key: ProfileKey;
  readonly profile: InvestorProfile;
  matches(score: number): boolean;
}

class ConservativeProfileStrategy implements InvestorProfileStrategy {
  readonly key: ProfileKey = "Conservative";
  readonly profile = profiles.Conservative;
  matches(score: number) {
    return score < 40;
  }
}

class ModerateProfileStrategy implements InvestorProfileStrategy {
  readonly key: ProfileKey = "Moderate";
  readonly profile = profiles.Moderate;
  matches(score: number) {
    return score >= 40 && score < 70;
  }
}

class AggressiveProfileStrategy implements InvestorProfileStrategy {
  readonly key: ProfileKey = "Aggressive";
  readonly profile = profiles.Aggressive;
  matches(score: number) {
    return score >= 70;
  }
}

const PROFILE_STRATEGIES: InvestorProfileStrategy[] = [new ConservativeProfileStrategy(), new ModerateProfileStrategy(), new AggressiveProfileStrategy()];

/** Percorre as estratégias da lista e devolve a primeira que aceita a nota. */
export function resolveInvestorProfile(score: number): InvestorProfileStrategy {
  return PROFILE_STRATEGIES.find((s) => s.matches(score)) ?? PROFILE_STRATEGIES[PROFILE_STRATEGIES.length - 1];
}
