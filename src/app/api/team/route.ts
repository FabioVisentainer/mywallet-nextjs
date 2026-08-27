import { prisma } from "@/lib/prisma";

export async function GET() {
  const members = await prisma.teamMember.findMany({ orderBy: { id: "asc" } });
  return Response.json({ members });
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const roleInTeam = String(body.roleInTeam || "").trim();

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Name the operator.";
  if (!email.includes("@")) errors.email = "Enter a valid email.";
  if (!["Trader", "Compliance", "Viewer"].includes(roleInTeam)) errors.roleInTeam = "Pick a role.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const member = await prisma.teamMember.create({
    data: { id: "tm" + Date.now(), name, email, roleInTeam, since: new Date().toISOString().slice(0, 10) },
  });
  return Response.json({ member });
}
