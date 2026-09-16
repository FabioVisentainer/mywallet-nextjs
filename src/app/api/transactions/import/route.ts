import { prisma } from "@/lib/prisma";
import { MarketDataGateway } from "@/lib/marketDataGateway";

// Imports one swap reported by the external broker feed (AIE, see
// src/mocks/external/brokerFeed.ts) into the app's own Transaction ledger
// (ALI). Req. 16: histórico de swaps de criptomoedas realizados em
// corretoras externas, para auditoria pessoal do investidor.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const swapId = String(body.swapId || "");
  const walletName = String(body.walletName || "").trim();

  if (!swapId || !walletName) {
    return Response.json({ error: "Pick a wallet to import this swap into." }, { status: 400 });
  }

  const already = await prisma.transaction.findFirst({ where: { externalRef: swapId } });
  if (already) return Response.json({ error: "This swap has already been imported." }, { status: 400 });

  const swap = MarketDataGateway.getInstance().getBrokerSwapById(swapId);
  if (!swap) return Response.json({ error: "This swap is no longer available from the exchange feed." }, { status: 404 });

  const price = MarketDataGateway.getInstance().getQuote(swap.toTicker, 0);
  const total = swap.toQty * price;

  const transaction = await prisma.transaction.create({
    data: {
      id: "tx" + Date.now(),
      date: swap.executedAt,
      type: "Swap",
      asset: `${swap.fromTicker} → ${swap.toTicker}`,
      wallet: walletName,
      qty: `${swap.fromQty} → ${swap.toQty}`,
      price,
      total,
      externalRef: swap.id,
    },
  });

  return Response.json({ transaction });
}
