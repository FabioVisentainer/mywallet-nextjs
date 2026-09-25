import { teamMemberRepository } from "@/server/repositories/teamMemberRepository";

export interface TeamMemberInput {
  name: string;
  email: string;
  roleInTeam: string;
}

const ROLES = ["Trader", "Compliance", "Viewer"];

/** Service — regra de negócio de TeamMember, reaproveitada pelo POST e pelo PATCH. */
export const teamMemberService = {
  list() {
    return teamMemberRepository.list();
  },

  validate(input: TeamMemberInput): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!input.name) errors.name = "Name the operator.";
    if (!input.email.includes("@")) errors.email = "Enter a valid email.";
    if (!ROLES.includes(input.roleInTeam)) errors.roleInTeam = "Pick a role.";
    return errors;
  },

  create(input: TeamMemberInput) {
    return teamMemberRepository.create({
      id: "tm" + Date.now(),
      name: input.name,
      email: input.email,
      roleInTeam: input.roleInTeam,
      since: new Date().toISOString().slice(0, 10),
    });
  },

  update(id: string, input: TeamMemberInput) {
    return teamMemberRepository.update(id, input);
  },

  remove(id: string) {
    return teamMemberRepository.remove(id);
  },
};
