import { prisma } from "@/lib/prisma";

const PLAN_NAMES = ["Standard", "Platinum", "Black"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const planName = String(body.planName || "").trim();
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const discountPct = parseFloat(String(body.discountPct));
  const startsAt = String(body.startsAt || "").trim();
  const endsAt = String(body.endsAt || "").trim();
  const active = body.active !== undefined ? Boolean(body.active) : undefined;

  const errors: Record<string, string> = {};
  if (!PLAN_NAMES.includes(planName)) errors.planName = "Pick a plan.";
  if (!title) errors.title = "Give the promotion a title.";
  if (!description) errors.description = "Describe the promotion.";
  if (!(discountPct > 0 && discountPct <= 100)) errors.discountPct = "Enter a discount between 1 and 100%.";
  if (!startsAt) errors.startsAt = "Set a start date.";
  if (!endsAt) errors.endsAt = "Set an end date.";
  if (startsAt && endsAt && endsAt < startsAt) errors.endsAt = "The end date must be on or after the start date.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const promotion = await prisma.promotion.update({
    where: { id },
    data: { planName, title, description, discountPct, startsAt, endsAt, ...(active !== undefined ? { active } : {}) },
  });
  return Response.json({ promotion });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.promotion.delete({ where: { id } });
  return Response.json({ ok: true });
}
