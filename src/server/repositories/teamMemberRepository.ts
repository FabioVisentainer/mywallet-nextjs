import { prisma } from "@/server/prisma";

/** Repository — único lugar que fala com o Prisma para TeamMember. */
export const teamMemberRepository = {
  list() {
    return prisma.teamMember.findMany({ orderBy: { id: "asc" } });
  },

  create(data: { id: string; name: string; email: string; roleInTeam: string; since: string }) {
    return prisma.teamMember.create({ data });
  },

  update(id: string, data: { name: string; email: string; roleInTeam: string }) {
    return prisma.teamMember.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.teamMember.delete({ where: { id } });
  },
};
