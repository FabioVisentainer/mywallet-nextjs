import { prisma } from "@/server/prisma";

/** Repository — único lugar que fala com o Prisma para Promotion. */
export const promotionRepository = {
  list() {
    return prisma.promotion.findMany({ orderBy: { startsAt: "desc" } });
  },

  create(data: {
    id: string; planName: string; title: string; description: string;
    discountPct: number; startsAt: string; endsAt: string; active: boolean; createdBy: string;
  }) {
    return prisma.promotion.create({ data });
  },

  update(
    id: string,
    data: { planName: string; title: string; description: string; discountPct: number; startsAt: string; endsAt: string; active?: boolean }
  ) {
    const { active, ...rest } = data;
    return prisma.promotion.update({ where: { id }, data: { ...rest, ...(active !== undefined ? { active } : {}) } });
  },

  remove(id: string) {
    return prisma.promotion.delete({ where: { id } });
  },
};
