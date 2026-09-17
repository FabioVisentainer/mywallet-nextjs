import { prisma } from "@/lib/prisma";
import { ValidatedCreateHandler } from "@/lib/validatedCreateHandler";

const PLAN_NAMES = ["Standard", "Platinum", "Black"];

interface PromotionCreateInput {
  planName: string;
  title: string;
  description: string;
  discountPct: number;
  startsAt: string;
  endsAt: string;
  createdBy: string;
}

/**
 * TEMPLATE METHOD — passos variáveis para o cadastro de uma promoção por tempo
 * determinado (ver ValidatedCreateHandler). Cadastrada por um atendente/administrador
 * a partir da tela de gestão de promoções; createdBy é o id do usuário logado que
 * está criando o registro (enviado pelo cliente a partir da sessão atual).
 */
class CreatePromotionHandler extends ValidatedCreateHandler<PromotionCreateInput, unknown> {
  protected parse(body: Record<string, unknown>): PromotionCreateInput {
    return {
      planName: String(body.planName || "").trim(),
      title: String(body.title || "").trim(),
      description: String(body.description || "").trim(),
      discountPct: parseFloat(String(body.discountPct)),
      startsAt: String(body.startsAt || "").trim(),
      endsAt: String(body.endsAt || "").trim(),
      createdBy: String(body.createdBy || "").trim(),
    };
  }

  protected validate(input: PromotionCreateInput) {
    const errors: Record<string, string> = {};
    if (!PLAN_NAMES.includes(input.planName)) errors.planName = "Pick a plan.";
    if (!input.title) errors.title = "Give the promotion a title.";
    if (!input.description) errors.description = "Describe the promotion.";
    if (!(input.discountPct > 0 && input.discountPct <= 100)) errors.discountPct = "Enter a discount between 1 and 100%.";
    if (!input.startsAt) errors.startsAt = "Set a start date.";
    if (!input.endsAt) errors.endsAt = "Set an end date.";
    if (input.startsAt && input.endsAt && input.endsAt < input.startsAt) errors.endsAt = "The end date must be on or after the start date.";
    return errors;
  }

  protected async persist(input: PromotionCreateInput) {
    return prisma.promotion.create({
      data: {
        id: "promo" + Date.now(),
        planName: input.planName,
        title: input.title,
        description: input.description,
        discountPct: input.discountPct,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        active: true,
        createdBy: input.createdBy || "unknown",
      },
    });
  }

  protected entityKey() {
    return "promotion";
  }
}

export async function GET() {
  const promotions = await prisma.promotion.findMany({ orderBy: { startsAt: "desc" } });
  return Response.json({ promotions });
}

export async function POST(request: Request) {
  return new CreatePromotionHandler().handle(request);
}
