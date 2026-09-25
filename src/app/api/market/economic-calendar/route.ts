import {MarketDataGateway} from "@/server/repositories/marketDataGateway";

// Simulated external economic-calendar provider, via the MarketDataGateway singleton.
export async function GET() {
  const events = MarketDataGateway.getInstance().getEconomicCalendar();
  return Response.json({ events });
}
