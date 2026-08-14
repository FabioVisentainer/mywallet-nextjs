import { prisma } from "@/lib/prisma";

export async function GET() {
  const goals = await prisma.goal.findMany({ orderBy: { id: "asc" } });
  return Response.json({ goals });
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const target = parseFloat(body.target);
  const due = String(body.due || "").trim();

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Name the goal.";
  if (!(target > 0)) errors.target = "Enter a target amount.";
  if (!due) errors.due = "Set a deadline.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const goal = await prisma.goal.create({ data: { id: "g" + Date.now(), name, target, current: 0, due } });
  return Response.json({ goal });
}
