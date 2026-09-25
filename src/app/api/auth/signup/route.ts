import {authService} from "@/server/services/authService";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  const errors = authService.validateSignup(name, email, password);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const result = await authService.signup(name, email, password);
  if ("errors" in result) return Response.json({ errors: result.errors }, { status: 400 });
  return Response.json({ user: result.user });
}
