export type UserRole = "Investor" | "Analyst" | "Administrator";
export type UserStatus = "Active" | "Suspended" | "Pending";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  last: string;
  since: string;
  perms: string;
}

export interface UserPermissions {
  view: boolean;
  wallets: boolean;
  publish: boolean;
  moderate: boolean;
  admin: boolean;
}

export interface ActivityEntry {
  text: string;
  when: string;
}
