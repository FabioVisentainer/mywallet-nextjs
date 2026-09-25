import { prisma } from "@/server/prisma";

/** Repository — único lugar que fala com o Prisma para User (e sua activity). */
export const userRepository = {
  list() {
    return prisma.user.findMany({ orderBy: { id: "asc" } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, include: { activity: { orderBy: { id: "desc" } } } });
  },

  findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email: { equals: email } } });
  },

  create(data: {
    id: string; name: string; email: string; passwordHash: string; role: string; status: string;
    perms: string; since: string; lastAccess: string; activityText: string; activityWhen: string;
  }) {
    return prisma.user.create({
      data: {
        id: data.id, name: data.name, email: data.email, passwordHash: data.passwordHash,
        role: data.role, status: data.status, perms: data.perms, since: data.since, lastAccess: data.lastAccess,
        activity: { create: [{ text: data.activityText, when: data.activityWhen }] },
      },
    });
  },

  update(id: string, data: Partial<{ role: string; status: string; perms: string; passwordHash: string }>) {
    return prisma.user.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};
