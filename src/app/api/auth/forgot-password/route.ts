import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/mocks/external/emailProvider";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes (Req. 3: prazo de expiração)

// Req. 3 — Recuperação de Senha. Always answers the same generic message,
// whether or not the e-mail is registered, so the response can't be used to
// enumerate accounts. The recovery link ("token") is delivered through an
// external transactional-e-mail provider (AIE, see mocks/external/emailProvider.ts);
// this app only keeps the token record and its expiry (ALI, PasswordResetToken).
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Enter a valid email address, e.g. name@domain.com." }, { status: 400 });
  }

  const user = await prisma.user.findFirst({ where: { email: { equals: email } } });

  let devToken: string | null = null;
  if (user) {
    const token = "prt" + Date.now() + Math.random().toString(36).slice(2, 8);
    const now = new Date();
    await prisma.passwordResetToken.create({
      data: {
        id: "rst" + Date.now(),
        userId: user.id,
        token,
        expiresAt: new Date(now.getTime() + TOKEN_TTL_MS).toISOString(),
        createdAt: now.toISOString(),
      },
    });
    sendTransactionalEmail(email, "Reset your MyWallet password");
    devToken = token; // exposed only so this prototype can render a working link without a real inbox
  }

  return Response.json({ ok: true, devToken });
}
