import {userRepository} from "@/server/repositories/userRepository";
import {hashPassword} from "@/server/password";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DEFAULT_PERMS: Record<string, string> = {
  Investor: "Wallets, goals, market data",
  Analyst: "Publish news, market data",
  Administrator: "Full system access",
};

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  last: string;
  since: string;
  perms: string;
}

export class DuplicateEmailError extends Error {}

function toSummary(row: { id: string; name: string; email: string; role: string; status: string; lastAccess: string; since: string; perms: string }): UserSummary {
  return { id: row.id, name: row.name, email: row.email, role: row.role, status: row.status, last: row.lastAccess, since: row.since, perms: row.perms };
}

/**
 * Service — regra de negócio de User (gestão administrativa, distinta do
 * fluxo de auto-cadastro em authService.signup).
 */
export const userService = {
  async list() {
    const rows = await userRepository.list();
    return rows.map(toSummary);
  },

  async findDetail(id: string) {
    const row = await userRepository.findById(id);
    if (!row) return null;
    const user = toSummary(row);
    const activity = row.activity.map((a) => ({ text: a.text, when: a.when }));
    return { user, activity };
  },

  validate(input: UserCreateInput): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!input.name) errors.name = "Enter the user\'s full name.";
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(input.email)) errors.email = "Enter a valid email address.";
    if (input.password.length < 8 || !/\d/.test(input.password)) errors.password = "Use at least 8 characters including one number.";
    if (!["Investor", "Analyst", "Administrator"].includes(input.role)) errors.role = "Pick a role.";
    return errors;
  },

  async create(input: UserCreateInput): Promise<UserSummary> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new DuplicateEmailError();

    const now = new Date();
    const since = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    const row = await userRepository.create({
      id: "u" + Date.now(),
      name: input.name,
      email: input.email,
      passwordHash: hashPassword(input.password),
      role: input.role,
      status: "Active",
      perms: DEFAULT_PERMS[input.role] ?? DEFAULT_PERMS.Investor,
      since,
      lastAccess: "\u2014",
      activityText: "Account created by an administrator",
      activityWhen: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
    });
    return toSummary(row);
  },

  async update(id: string, data: { role?: string; status?: string; perms?: string }) {
    const patch: Record<string, string> = {};
    if (data.role) patch.role = data.role;
    if (data.status) patch.status = data.status;
    if (data.perms) patch.perms = data.perms;
    const row = await userRepository.update(id, patch);
    return toSummary(row);
  },

  remove(id: string) {
    return userRepository.remove(id);
  },
};
