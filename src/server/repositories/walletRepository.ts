import {prisma} from "@/server/prisma";

/** Repository — único lugar que fala com o Prisma para Wallet. */
export const walletRepository = {
  listWithAssets() {
    return prisma.wallet.findMany({ orderBy: { id: "asc" }, include: { assets: true } });
  },

  findByName(name: string, excludeId?: string) {
    return prisma.wallet.findFirst({
      where: excludeId ? { name: { equals: name }, NOT: { id: excludeId } } : { name: { equals: name } },
    });
  },

  create(data: { id: string; name: string; kind: string; icon: string; tint: string; tintFg: string; created: string }) {
    return prisma.wallet.create({ data });
  },

  update(id: string, data: { name: string }) {
    return prisma.wallet.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.wallet.delete({ where: { id } });
  },
};
