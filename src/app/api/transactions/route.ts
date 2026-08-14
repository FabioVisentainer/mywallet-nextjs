import { prisma } from "@/lib/prisma";

export async function GET() {
  const transactions = await prisma.transaction.findMany({ orderBy: { date: "desc" } });
  return Response.json({ transactions });
}
