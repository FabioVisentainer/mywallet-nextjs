import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const name = String(body.name || "").trim();
  const target = parseFloat(body.target);
  const due = String(body.due || "").trim();

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Name the goal.";
  if (!(target > 0)) errors.target = "Enter a target amount.";
  if (!due) errors.due = "Set a deadline.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const goal = await prisma.goal.update({ where: { id }, data: { name, target, due } });
  return Response.json({ goal });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.goal.delete({ where: { id } });
  return Response.json({ ok: true });
}
