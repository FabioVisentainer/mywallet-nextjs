import { prisma } from "@/server/prisma";

/** Repository — único lugar que fala com o Prisma para InvestorProfileResult. */
export const quizResultRepository = {
  findLatestForUser(userId: string) {
    return prisma.investorProfileResult.findFirst({ where: { userId }, orderBy: { completedAt: "desc" } });
  },

  create(data: { id: string; userId: string; score: number; profileKey: string; answers: string; completedAt: string }) {
    return prisma.investorProfileResult.create({ data });
  },
};
