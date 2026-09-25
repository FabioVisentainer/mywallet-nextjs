import { promotionService, type PromotionInput } from "@/server/services/promotionService";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const input: PromotionInput = {
    planName: String(body.planName || "").trim(),
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    discountPct: parseFloat(String(body.discountPct)),
    startsAt: String(body.startsAt || "").trim(),
    endsAt: String(body.endsAt || "").trim(),
  };
  const active = body.active !== undefined ? Boolean(body.active) : undefined;

  const errors = promotionService.validate(input);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const promotion = await promotionService.update(id, input, active);
  return Response.json({ promotion });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await promotionService.remove(id);
  return Response.json({ ok: true });
}
