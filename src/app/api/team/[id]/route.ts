import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const roleInTeam = String(body.roleInTeam || "").trim();

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Name the operator.";
  if (!email.includes("@")) errors.email = "Enter a valid email.";
  if (!["Trader", "Compliance", "Viewer"].includes(roleInTeam)) errors.roleInTeam = "Pick a role.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const member = await prisma.teamMember.update({ where: { id }, data: { name, email, roleInTeam } });
  return Response.json({ member });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.teamMember.delete({ where: { id } });
  return Response.json({ ok: true });
}
