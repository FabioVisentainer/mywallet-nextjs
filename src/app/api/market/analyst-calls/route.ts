import { analystCalls } from "@/mocks/external/analystCalls";

// Simulated external research/recommendations feed.
export async function GET() {
  return Response.json({ calls: analystCalls });
}
