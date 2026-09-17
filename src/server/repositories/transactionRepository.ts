import { prisma } from "@/server/prisma";

/** Repository — único lugar que fala com o Prisma para Transaction. */
export const transactionRepository = {
  list() {
    return prisma.transaction.findMany({ orderBy: { date: "desc" } });
  },

  findByExternalRef(externalRef: string) {
    return prisma.transaction.findFirst({ where: { externalRef } });
  },

  create(data: {
    id: string; date: string; type: string; asset: string; wallet: string;
    qty: string; price: number; total: number; externalRef?: string;
  }) {
    return prisma.transaction.create({ data });
  },

  update(id: string, data: { date: string; type: string; asset: string; wallet: string; qty: string; price: number; total: number }) {
    return prisma.transaction.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.transaction.delete({ where: { id } });
  },
};
