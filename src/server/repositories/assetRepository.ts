import { prisma } from "@/server/prisma";

/** Repository — único lugar que fala com o Prisma para Asset. */
export const assetRepository = {
  create(data: { id: string; walletId: string; ticker: string; name: string; type: string; qty: number; avg: number }) {
    return prisma.asset.create({ data });
  },

  update(id: string, data: { ticker: string; name: string; type: string; qty: number; avg: number }) {
    return prisma.asset.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.asset.delete({ where: { id } });
  },
};
