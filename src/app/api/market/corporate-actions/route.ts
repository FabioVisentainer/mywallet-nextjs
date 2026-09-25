import {MarketDataGateway} from "@/server/repositories/marketDataGateway";

// Simulated external corporate-actions provider (dividends/splits), via the MarketDataGateway singleton.
export async function GET(request: Request) {
  const tickers = (new URL(request.url).searchParams.get("tickers") || "").split(",").filter(Boolean);
  const actions = MarketDataGateway.getInstance().getUpcomingActions(tickers);
  return Response.json({ actions });
}
