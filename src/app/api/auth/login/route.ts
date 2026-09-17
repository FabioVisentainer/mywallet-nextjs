import { authService } from "@/server/services/authService";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return Response.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const result = await authService.login(email, password);
  if ("error" in result) {
    if (result.error === "suspended") {
      return Response.json({ error: "This account has been suspended. Contact an administrator." }, { status: 403 });
    }
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }
  return Response.json({ user: result.user });
}
