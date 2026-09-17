import { prisma } from "@/server/prisma";

/** Repository — único lugar que fala com o Prisma para Goal. */
export const goalRepository = {
  list() {
    return prisma.goal.findMany({ orderBy: { id: "asc" } });
  },

  create(data: { id: string; name: string; target: number; current: number; due: string }) {
    return prisma.goal.create({ data });
  },

  update(id: string, data: { name: string; target: number; due: string }) {
    return prisma.goal.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.goal.delete({ where: { id } });
  },
};
