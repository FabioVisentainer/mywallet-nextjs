import { walletService } from "@/server/services/walletService";

export async function GET() {
  const data = await walletService.list();
  return Response.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();

  const error = await walletService.validateName(name);
  if (error) return Response.json({ error }, { status: 400 });

  const wallet = await walletService.create(name);
  return Response.json({ wallet });
}
