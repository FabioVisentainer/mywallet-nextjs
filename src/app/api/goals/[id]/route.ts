import {type GoalCreateInput, goalService} from "@/server/services/goalService";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const input: GoalCreateInput = {
    name: String(body.name || "").trim(),
    target: parseFloat(body.target),
    due: String(body.due || "").trim(),
  };

  const errors = goalService.validate(input);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const goal = await goalService.update(id, input);
  return Response.json({ goal });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await goalService.remove(id);
  return Response.json({ ok: true });
}
