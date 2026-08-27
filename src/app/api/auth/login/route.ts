import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return Response.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({ where: { email: { equals: email } } });

  // Same generic error whether the account doesn't exist or the password is wrong,
  // and verifyPassword always runs (even with a dummy hash) so failed lookups and
  // failed password checks take about the same time — avoids leaking which case it was.
  const DUMMY_HASH = "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000:0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
  const ok = verifyPassword(password, user?.passwordHash || DUMMY_HASH);

  if (!user || !ok) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }
  if (user.status === "Suspended") {
    return Response.json({ error: "This account has been suspended. Contact an administrator." }, { status: 403 });
  }

  return Response.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, accountType: user.accountType },
  });
}
