import {type InvestorProfile, profiles} from "./data";

type ProfileKey = "Conservative" | "Moderate" | "Aggressive";

/**
 * STRATEGY — exemplo 2 de 3.
 *
 * Onde: qual perfil de investidor (Conservative/Moderate/Aggressive) o resultado
 * do teste devolve, a partir da pontuação (0–100).
 *
 * Por quê: a regra de decisão era um encadeamento de ternários
 * (`s < 40 ? "Conservative" : s < 70 ? "Moderate" : "Aggressive"`) dentro do
 * `useMemo` do `QuizContext`. Cada faixa de pontuação passa a ser uma classe
 * própria — para adicionar um quarto perfil (ex.: "Ultra-conservative"), basta
 * criar uma nova estratégia e registrá-la, sem tocar na regra das outras.
 * Domínio totalmente diferente do Strategy de planos (`gating.ts`): aqui a
 * variação é sobre como classificar uma pontuação, não sobre o que uma
 * assinatura libera.
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

/** Percorre as estratégias registradas e devolve a primeira cuja faixa contém o score. */
export function resolveInvestorProfile(score: number): InvestorProfileStrategy {
  return PROFILE_STRATEGIES.find((s) => s.matches(score)) ?? PROFILE_STRATEGIES[PROFILE_STRATEGIES.length - 1];
}
