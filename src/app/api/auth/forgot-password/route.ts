import { authService } from "@/server/services/authService";

// Req. 3 — Recuperação de Senha. Resposta sempre genérica, com ou sem conta
// cadastrada nesse e-mail, pra não permitir enumerar contas.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();

  const result = await authService.forgotPassword(email);
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 });
  return Response.json({ ok: true, devToken: result.devToken });
}
