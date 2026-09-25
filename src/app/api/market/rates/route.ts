import {MarketDataGateway} from "@/server/repositories/marketDataGateway";

// Simulated external FX-rates provider response, via the MarketDataGateway singleton.
export async function GET() {
  const rates = MarketDataGateway.getInstance().getCurrencyRates();
  return Response.json({ rates });
}
