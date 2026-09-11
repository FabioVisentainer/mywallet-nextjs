import { prisma } from "@/lib/prisma";
import { ValidatedCreateHandler } from "@/lib/validatedCreateHandler";

interface TeamMemberCreateInput {
  name: string;
  email: string;
  roleInTeam: string;
}

/** TEMPLATE METHOD — passos variáveis para criar um operador do time (ver ValidatedCreateHandler). */
class CreateTeamMemberHandler extends ValidatedCreateHandler<TeamMemberCreateInput, unknown> {
  protected parse(body: Record<string, unknown>): TeamMemberCreateInput {
    return {
      name: String(body.name || "").trim(),
      email: String(body.email || "").trim(),
      roleInTeam: String(body.roleInTeam || "").trim(),
    };
  }

  protected validate(input: TeamMemberCreateInput) {
    const errors: Record<string, string> = {};
    if (!input.name) errors.name = "Name the operator.";
    if (!input.email.includes("@")) errors.email = "Enter a valid email.";
    if (!["Trader", "Compliance", "Viewer"].includes(input.roleInTeam)) errors.roleInTeam = "Pick a role.";
    return errors;
  }

  protected async persist(input: TeamMemberCreateInput) {
    return prisma.teamMember.create({
      data: { id: "tm" + Date.now(), name: input.name, email: input.email, roleInTeam: input.roleInTeam, since: new Date().toISOString().slice(0, 10) },
    });
  }

  protected entityKey() {
    return "member";
  }
}

export async function GET() {
  const members = await prisma.teamMember.findMany({ orderBy: { id: "asc" } });
  return Response.json({ members });
}

export async function POST(request: Request) {
  return new CreateTeamMemberHandler().handle(request);
}
