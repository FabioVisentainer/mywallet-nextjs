import {transactionService} from "@/server/services/transactionService";

// Importa um swap reportado pelo feed simulado da corretora externa (AIE, ver
// src/mocks/external/brokerFeed.ts) pro extrato próprio do app (ALI). Req. 16.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const swapId = String(body.swapId || "");
  const walletName = String(body.walletName || "").trim();

  if (!swapId || !walletName) {
    return Response.json({ error: "Pick a wallet to import this swap into." }, { status: 400 });
  }

  const result = await transactionService.importSwap(swapId, walletName);
  if ("error" in result) {
    if (result.error === "not_found") {
      return Response.json({ error: "This swap is no longer available from the exchange feed." }, { status: 404 });
    }
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ transaction: result.transaction });
}
