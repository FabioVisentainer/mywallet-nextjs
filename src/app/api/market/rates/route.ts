import { currencyRates } from "@/mocks/external/rates";

// Simulated external FX-rates provider response.
export async function GET() {
  return Response.json({ rates: currencyRates });
}
