import {authService} from "@/server/services/authService";

// Req. 3 — Recuperação de Senha (parte 2): valida o token e grava a nova senha.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "").trim();
  const password = String(body.password || "");

  const result = await authService.resetPassword(token, password);
  if ("errors" in result) return Response.json({ errors: result.errors }, { status: 400 });
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 });
  return Response.json({ ok: true });
}
