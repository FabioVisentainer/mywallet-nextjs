import { MarketDataGateway } from "@/lib/marketDataGateway";

// Simulated external asset-classification/reference-data provider, via the MarketDataGateway singleton.
export async function GET(request: Request) {
  const ticker = new URL(request.url).searchParams.get("ticker") || "";
  const reference = MarketDataGateway.getInstance().getAssetReference(ticker);
  return Response.json({ reference });
}
