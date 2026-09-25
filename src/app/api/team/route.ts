import { ValidatedCreateHandler } from "@/server/controllers/validatedCreateHandler";
import { teamMemberService, type TeamMemberInput } from "@/server/services/teamMemberService";

/** TEMPLATE METHOD — passos variáveis para criar um operador do time (ver ValidatedCreateHandler). */
class CreateTeamMemberHandler extends ValidatedCreateHandler<TeamMemberInput, unknown> {
  protected parse(body: Record<string, unknown>): TeamMemberInput {
    return {
      name: String(body.name || "").trim(),
      email: String(body.email || "").trim(),
      roleInTeam: String(body.roleInTeam || "").trim(),
    };
  }

  protected validate(input: TeamMemberInput) {
    return teamMemberService.validate(input);
  }

  protected persist(input: TeamMemberInput) {
    return teamMemberService.create(input);
  }

  protected entityKey() {
    return "member";
  }
}

export async function GET() {
  const members = await teamMemberService.list();
  return Response.json({ members });
}

export async function POST(request: Request) {
  return new CreateTeamMemberHandler().handle(request);
}
