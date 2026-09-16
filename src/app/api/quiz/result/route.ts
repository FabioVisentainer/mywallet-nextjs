import { prisma } from "@/lib/prisma";
import { ValidatedCreateHandler } from "@/lib/validatedCreateHandler";

interface ProfileResultInput {
  userId: string;
  score: number;
  profileKey: string;
  answers: Record<number, number>;
}

// Req. 6 — Teste de Perfil de Investidor. Every completed attempt ("realizar"
// ou "refazer") is stored as a new row, keeping history instead of overwriting
// the previous result.
class SaveProfileResultHandler extends ValidatedCreateHandler<ProfileResultInput, unknown> {
  protected parse(body: Record<string, unknown>): ProfileResultInput {
    return {
      userId: String(body.userId || ""),
      score: Number(body.score),
      profileKey: String(body.profileKey || ""),
      answers: (body.answers as Record<number, number>) || {},
    };
  }

  protected validate(input: ProfileResultInput) {
    const errors: Record<string, string> = {};
    if (!input.userId) errors.userId = "Missing user.";
    if (!(input.score >= 0 && input.score <= 100)) errors.score = "Invalid score.";
    if (!["Conservative", "Moderate", "Aggressive"].includes(input.profileKey)) errors.profileKey = "Invalid profile.";
    return errors;
  }

  protected async persist(input: ProfileResultInput) {
    return prisma.investorProfileResult.create({
      data: {
        id: "ipr" + Date.now(),
        userId: input.userId,
        score: Math.round(input.score),
        profileKey: input.profileKey,
        answers: JSON.stringify(input.answers),
        completedAt: new Date().toISOString(),
      },
    });
  }

  protected entityKey() {
    return "result";
  }
}

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId") || "";
  if (!userId) return Response.json({ result: null });
  const result = await prisma.investorProfileResult.findFirst({ where: { userId }, orderBy: { completedAt: "desc" } });
  return Response.json({ result });
}

export async function POST(request: Request) {
  return new SaveProfileResultHandler().handle(request);
}
