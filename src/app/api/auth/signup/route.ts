import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Enter your full name.";
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) errors.email = "Enter a valid email address, e.g. name@domain.com.";
  if (password.length < 8 || !/\d/.test(password)) errors.password = "Use at least 8 characters including one number.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const existing = await prisma.user.findFirst({ where: { email: { equals: email } } });
  if (existing) return Response.json({ errors: { email: "An account with this email already exists." } }, { status: 400 });

  const now = new Date();
  const since = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const lastAccess = now.toISOString().slice(0, 10);

  const user = await prisma.user.create({
    data: {
      id: "u" + Date.now(),
      name,
      email,
      passwordHash: hashPassword(password),
      role: "Investor",
      status: "Active",
      perms: "Wallets, goals, market data",
      since,
      lastAccess,
      activity: { create: [{ text: "Account created", when: `${lastAccess} ${now.toTimeString().slice(0, 5)}` }] },
    },
  });

  return Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
