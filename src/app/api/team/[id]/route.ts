import {type TeamMemberInput, teamMemberService} from "@/server/services/teamMemberService";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const input: TeamMemberInput = {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim(),
    roleInTeam: String(body.roleInTeam || "").trim(),
  };

  const errors = teamMemberService.validate(input);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const member = await teamMemberService.update(id, input);
  return Response.json({ member });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await teamMemberService.remove(id);
  return Response.json({ ok: true });
}
