import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const name = String(body.name || "").trim();
  if (name.length < 3) return Response.json({ error: "Use at least 3 characters." }, { status: 400 });

  const dup = await prisma.wallet.findFirst({ where: { name: { equals: name }, NOT: { id } } });
  if (dup) return Response.json({ error: "A wallet with this name already exists." }, { status: 400 });

  const wallet = await prisma.wallet.update({ where: { id }, data: { name } });
  return Response.json({ wallet });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.wallet.delete({ where: { id } });
  return Response.json({ ok: true });
}
