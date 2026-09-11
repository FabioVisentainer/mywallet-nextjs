import { MarketDataGateway } from "@/lib/marketDataGateway";

// Simulated external research/recommendations feed, via the MarketDataGateway singleton.
export async function GET() {
  const calls = MarketDataGateway.getInstance().getAnalystCalls();
  return Response.json({ calls });
}
