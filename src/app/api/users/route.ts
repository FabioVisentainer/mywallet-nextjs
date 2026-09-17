import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { ValidatedCreateHandler } from "@/lib/validatedCreateHandler";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DEFAULT_PERMS: Record<string, string> = {
  Investor: "Wallets, goals, market data",
  Analyst: "Publish news, market data",
  Administrator: "Full system access",
};

interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  last: string;
  since: string;
  perms: string;
}

function toSummary(row: { id: string; name: string; email: string; role: string; status: string; lastAccess: string; since: string; perms: string }): UserSummary {
  return { id: row.id, name: row.name, email: row.email, role: row.role, status: row.status, last: row.lastAccess, since: row.since, perms: row.perms };
}

/**
 * TEMPLATE METHOD — passos variáveis para a criação administrativa de uma conta
 * (ver ValidatedCreateHandler). Distinto de /api/auth/signup: aqui é um
 * administrador cadastrando a conta de outra pessoa a partir da tela de gestão
 * de usuários, então não passa pela checagem de watchlist AML/KYC do auto-cadastro.
 */
class CreateUserHandler extends ValidatedCreateHandler<UserCreateInput, UserSummary> {
  protected parse(body: Record<string, unknown>): UserCreateInput {
    return {
      name: String(body.name || "").trim(),
      email: String(body.email || "").trim().toLowerCase(),
      password: String(body.password || ""),
      role: String(body.role || "Investor").trim(),
    };
  }

  protected validate(input: UserCreateInput) {
    const errors: Record<string, string> = {};
    if (!input.name) errors.name = "Enter the user's full name.";
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(input.email)) errors.email = "Enter a valid email address.";
    if (input.password.length < 8 || !/\d/.test(input.password)) errors.password = "Use at least 8 characters including one number.";
    if (!["Investor", "Analyst", "Administrator"].includes(input.role)) errors.role = "Pick a role.";
    return errors;
  }

  protected async persist(input: UserCreateInput) {
    const existing = await prisma.user.findFirst({ where: { email: { equals: input.email } } });
    if (existing) throw new DuplicateEmailError();

    const now = new Date();
    const since = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    const row = await prisma.user.create({
      data: {
        id: "u" + Date.now(),
        name: input.name,
        email: input.email,
        passwordHash: hashPassword(input.password),
        role: input.role,
        status: "Active",
        perms: DEFAULT_PERMS[input.role] ?? DEFAULT_PERMS.Investor,
        since,
        lastAccess: "—",
        activity: { create: [{ text: "Account created by an administrator", when: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}` }] },
      },
    });
    return toSummary(row);
  }

  protected entityKey() {
    return "user";
  }

  async handle(request: Request): Promise<Response> {
    try {
      return await super.handle(request);
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        return Response.json({ errors: { email: "An account with this email already exists." } }, { status: 400 });
      }
      throw err;
    }
  }
}

class DuplicateEmailError extends Error {}

export async function GET() {
  const rows = await prisma.user.findMany({ orderBy: { id: "asc" } });
  const users = rows.map(toSummary);
  return Response.json({ users });
}

export async function POST(request: Request) {
  return new CreateUserHandler().handle(request);
}
