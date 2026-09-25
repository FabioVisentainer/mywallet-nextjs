import {walletService} from "@/server/services/walletService";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: walletId } = await params;
  const body = await request.json();
  const input = {
    ticker: String(body.ticker || "").trim(),
    name: String(body.name || "").trim(),
    qty: parseFloat(body.qty),
    avg: parseFloat(body.avg),
    type: body.type as string | undefined,
  };

  const errors = walletService.validateAsset(input);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const asset = await walletService.createAsset(walletId, input);
  return Response.json({ asset });
}
