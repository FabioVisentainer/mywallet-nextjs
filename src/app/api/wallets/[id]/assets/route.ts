import { prisma } from "@/lib/prisma";
import { MarketDataGateway } from "@/lib/marketDataGateway";
import type { Asset } from "@/modules/wallets/types";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: walletId } = await params;
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

  const created = await prisma.asset.create({
    data: { id: "a" + Date.now(), walletId, ticker: ticker.toUpperCase(), name, type: body.type || "Stock", qty, avg },
  });
  const asset: Asset = {
    id: created.id,
    ticker: created.ticker,
    name: created.name,
    type: created.type as Asset["type"],
    qty: created.qty,
    avg: created.avg,
    price: MarketDataGateway.getInstance().getQuote(created.ticker, created.avg),
  };
  return Response.json({ asset });
}
