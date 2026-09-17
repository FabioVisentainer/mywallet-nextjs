import { ValidatedCreateHandler } from "@/server/controllers/validatedCreateHandler";
import { goalService, type GoalCreateInput } from "@/server/services/goalService";

/** TEMPLATE METHOD — passos variáveis para criar uma meta financeira (ver ValidatedCreateHandler). */
class CreateGoalHandler extends ValidatedCreateHandler<GoalCreateInput, unknown> {
  protected parse(body: Record<string, unknown>): GoalCreateInput {
    return {
      name: String(body.name || "").trim(),
      target: parseFloat(String(body.target)),
      due: String(body.due || "").trim(),
    };
  }

  protected validate(input: GoalCreateInput) {
    return goalService.validate(input);
  }

  protected persist(input: GoalCreateInput) {
    return goalService.create(input);
  }

  protected entityKey() {
    return "goal";
  }
}

export async function GET() {
  const goals = await goalService.list();
  return Response.json({ goals });
}

export async function POST(request: Request) {
  return new CreateGoalHandler().handle(request);
}
