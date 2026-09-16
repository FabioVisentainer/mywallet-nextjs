import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

// Req. 3 — Recuperação de Senha (parte 2): valida o token (existe, não foi
// usado, não expirou) e grava a nova senha.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "").trim();
  const password = String(body.password || "");

  if (password.length < 8 || !/\d/.test(password)) {
    return Response.json({ errors: { password: "Use at least 8 characters including one number." } }, { status: 400 });
  }

  const record = await prisma.passwordResetToken.findFirst({ where: { token } });
  if (!record) {
    return Response.json({ error: "This recovery link is invalid. Request a new one." }, { status: 400 });
  }
  if (record.usedAt) {
    return Response.json({ error: "This recovery link has already been used. Request a new one." }, { status: 400 });
  }
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return Response.json({ error: "This recovery link has expired. Request a new one." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash: hashPassword(password) } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date().toISOString() } }),
  ]);

  return Response.json({ ok: true });
}
