import { quizResultRepository } from "@/server/repositories/quizResultRepository";

export interface ProfileResultInput {
  userId: string;
  score: number;
  profileKey: string;
  answers: Record<number, number>;
}

const PROFILES = ["Conservative", "Moderate", "Aggressive"];

/** Service — regra de negócio do histórico de resultados do teste de perfil (não é CRUD, ver 3 - CRUD.md). */
export const quizService = {
  findLatestForUser(userId: string) {
    if (!userId) return Promise.resolve(null);
    return quizResultRepository.findLatestForUser(userId);
  },

  validate(input: ProfileResultInput): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!input.userId) errors.userId = "Missing user.";
    if (!(input.score >= 0 && input.score <= 100)) errors.score = "Invalid score.";
    if (!PROFILES.includes(input.profileKey)) errors.profileKey = "Invalid profile.";
    return errors;
  },

  create(input: ProfileResultInput) {
    return quizResultRepository.create({
      id: "ipr" + Date.now(),
      userId: input.userId,
      score: Math.round(input.score),
      profileKey: input.profileKey,
      answers: JSON.stringify(input.answers),
      completedAt: new Date().toISOString(),
    });
  },
};
