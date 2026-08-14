import { prisma } from "@/lib/prisma";
import { getQuote } from "@/mocks/external/quotes";
import type { Asset } from "@/modules/wallets/types";

function serializeAsset(a: { id: string; ticker: string; name: string; type: string; qty: number; avg: number }): Asset {
  return {
    id: a.id,
    ticker: a.ticker,
    name: a.name,
    type: a.type as Asset["type"],
    qty: a.qty,
    avg: a.avg,
    price: getQuote(a.ticker, a.avg),
  };
}

export async function GET() {
  const wallets = await prisma.wallet.findMany({ orderBy: { id: "asc" }, include: { assets: true } });
  const assets: Record<string, Asset[]> = {};
  for (const w of wallets) assets[w.id] = w.assets.map(serializeAsset);
  return Response.json({
    wallets: wallets.map(({ id, name, kind, icon, tint, tintFg, created }) => ({ id, name, kind, icon, tint, tintFg, created })),
    assets,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  if (name.length < 3) return Response.json({ error: "Use at least 3 characters." }, { status: 400 });

  const dup = await prisma.wallet.findFirst({ where: { name: { equals: name } } });
  if (dup) return Response.json({ error: "A wallet with this name already exists." }, { status: 400 });

  const wallet = await prisma.wallet.create({
    data: {
      id: "w" + Date.now(),
      name,
      kind: "Custom",
      icon: "◆",
      tint: "#FFF6ED",
      tintFg: "#B54708",
      created: "Aug 2026",
    },
  });
  return Response.json({ wallet });
}
