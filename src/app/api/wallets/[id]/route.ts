import {walletService} from "@/server/services/walletService";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const name = String(body.name || "").trim();

  const error = await walletService.validateName(name, id);
  if (error) return Response.json({ error }, { status: 400 });

  const wallet = await walletService.update(id, name);
  return Response.json({ wallet });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await walletService.remove(id);
  return Response.json({ ok: true });
}
