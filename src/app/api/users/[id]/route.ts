import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await prisma.user.findUnique({ where: { id }, include: { activity: { orderBy: { id: "desc" } } } });
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  const user = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    last: row.lastAccess,
    since: row.since,
    perms: row.perms,
  };
  const activity = row.activity.map((a) => ({ text: a.text, when: a.when }));
  return Response.json({ user, activity });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const data: Record<string, string> = {};
  if (body.role) data.role = body.role;
  if (body.status) data.status = body.status;
  if (body.perms) data.perms = body.perms;

  const row = await prisma.user.update({ where: { id }, data });
  const user = { id: row.id, name: row.name, email: row.email, role: row.role, status: row.status, last: row.lastAccess, since: row.since, perms: row.perms };
  return Response.json({ user });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return Response.json({ ok: true });
}
