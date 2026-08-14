import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.user.findMany({ orderBy: { id: "asc" } });
  const users = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    last: u.lastAccess,
    since: u.since,
    perms: u.perms,
  }));
  return Response.json({ users });
}
