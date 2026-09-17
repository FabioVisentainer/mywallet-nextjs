import { prisma } from "@/server/prisma";

/** Repository — único lugar que fala com o Prisma para Article. */
export const articleRepository = {
  list() {
    return prisma.article.findMany({ orderBy: { date: "desc" } });
  },

  findById(id: string) {
    return prisma.article.findUnique({ where: { id } });
  },

  create(data: {
    id: string; title: string; category: string; date: string; views: number;
    status: string; author: string; read: string; summary: string; body: string | null;
  }) {
    return prisma.article.create({ data });
  },

  update(id: string, data: { title: string; category: string; summary: string; body: string | null; status: string }) {
    return prisma.article.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.article.delete({ where: { id } });
  },
};
