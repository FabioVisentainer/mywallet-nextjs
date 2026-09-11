import { prisma } from "@/lib/prisma";
import { ValidatedCreateHandler } from "@/lib/validatedCreateHandler";

interface GoalCreateInput {
  name: string;
  target: number;
  due: string;
}

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
    const errors: Record<string, string> = {};
    if (!input.name) errors.name = "Name the goal.";
    if (!(input.target > 0)) errors.target = "Enter a target amount.";
    if (!input.due) errors.due = "Set a deadline.";
    return errors;
  }

  protected async persist(input: GoalCreateInput) {
    return prisma.goal.create({ data: { id: "g" + Date.now(), name: input.name, target: input.target, current: 0, due: input.due } });
  }

  protected entityKey() {
    return "goal";
  }
}

export async function GET() {
  const goals = await prisma.goal.findMany({ orderBy: { id: "asc" } });
  return Response.json({ goals });
}

export async function POST(request: Request) {
  return new CreateGoalHandler().handle(request);
}
