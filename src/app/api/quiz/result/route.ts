import { ValidatedCreateHandler } from "@/server/controllers/validatedCreateHandler";
import { quizService, type ProfileResultInput } from "@/server/services/quizService";

// TEMPLATE METHOD: preenche os passos do ValidatedCreateHandler para salvar o
// resultado do teste de perfil de investidor (requisito 6). Cada tentativa
// concluída, seja a primeira ou um refazer, vira um registro novo. É um
// histórico, não um CRUD (ver 3 - CRUD.md).
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
    return quizService.validate(input);
  }

  protected persist(input: ProfileResultInput) {
    return quizService.create(input);
  }

  protected entityKey() {
    return "result";
  }
}

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId") || "";
  const result = await quizService.findLatestForUser(userId);
  return Response.json({ result });
}

export async function POST(request: Request) {
  return new SaveProfileResultHandler().handle(request);
}
