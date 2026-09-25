import {prisma} from "@/server/prisma";

/** Repository — único lugar que fala com o Prisma para PasswordResetToken. */
export const passwordResetTokenRepository = {
  create(data: { id: string; userId: string; token: string; expiresAt: string; createdAt: string }) {
    return prisma.passwordResetToken.create({ data });
  },

  findByToken(token: string) {
    return prisma.passwordResetToken.findFirst({ where: { token } });
  },

  markUsed(id: string, usedAt: string) {
    return prisma.passwordResetToken.update({ where: { id }, data: { usedAt } });
  },
};
