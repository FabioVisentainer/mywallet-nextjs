export type TeamRole = "Trader" | "Compliance" | "Viewer";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  roleInTeam: TeamRole;
  since: string;
}

export interface TeamMemberInput {
  name: string;
  email: string;
  roleInTeam: TeamRole;
}
