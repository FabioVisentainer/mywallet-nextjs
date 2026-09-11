import { MarketDataGateway } from "@/lib/marketDataGateway";

// Simulated external market-data provider response, via the MarketDataGateway singleton.
export async function GET() {
  const { months, series, benchSeries } = MarketDataGateway.getInstance().getMarketSeries();
  return Response.json({ months, series, benchSeries });
}
