import { prisma } from "@/lib/prisma";
import { MarketDataGateway } from "@/lib/marketDataGateway";

// Simulated external exchange swap-history feed, via the MarketDataGateway singleton.
// Excludes swaps already imported into the Transaction ledger (Transaction.externalRef).
export async function GET() {
  const imported = await prisma.transaction.findMany({ where: { NOT: { externalRef: null } }, select: { externalRef: true } });
  const importedIds = imported.map((t) => t.externalRef as string);
  const swaps = MarketDataGateway.getInstance().getPendingBrokerSwaps(importedIds);
  return Response.json({ swaps });
}
