import { months, series, benchSeries } from "@/mocks/external/performance";

// Simulated external market-data provider response.
export async function GET() {
  return Response.json({ months, series, benchSeries });
}
