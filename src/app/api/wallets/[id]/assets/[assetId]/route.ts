import {walletService} from "@/server/services/walletService";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; assetId: string }> }) {
  const { assetId } = await params;
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

  const asset = await walletService.updateAsset(assetId, input);
  return Response.json({ asset });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; assetId: string }> }) {
  const { assetId } = await params;
  await walletService.removeAsset(assetId);
  return Response.json({ ok: true });
}
