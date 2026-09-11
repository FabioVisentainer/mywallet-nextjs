import { prisma } from "@/lib/prisma";
import { MarketDataGateway } from "@/lib/marketDataGateway";
import type { Asset } from "@/modules/wallets/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; assetId: string }> }) {
  const { assetId } = await params;
  const body = await request.json();
  const ticker = String(body.ticker || "").trim();
  const name = String(body.name || "").trim();
  const qty = parseFloat(body.qty);
  const avg = parseFloat(body.avg);

  const errors: Record<string, string> = {};
  if (!ticker) errors.ticker = "Ticker is required.";
  if (!name) errors.name = "Asset name is required.";
  if (!(qty > 0)) errors.qty = "Enter a quantity greater than zero.";
  if (!(avg > 0)) errors.avg = "Enter a valid average price.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const updated = await prisma.asset.update({
    where: { id: assetId },
    data: { ticker: ticker.toUpperCase(), name, type: body.type || "Stock", qty, avg },
  });
  const asset: Asset = {
    id: updated.id,
    ticker: updated.ticker,
    name: updated.name,
    type: updated.type as Asset["type"],
    qty: updated.qty,
    avg: updated.avg,
    price: MarketDataGateway.getInstance().getQuote(updated.ticker, updated.avg),
  };
  return Response.json({ asset });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; assetId: string }> }) {
  const { assetId } = await params;
  await prisma.asset.delete({ where: { id: assetId } });
  return Response.json({ ok: true });
}
