import { ValidatedCreateHandler } from "@/server/controllers/validatedCreateHandler";
import { promotionService, type PromotionInput } from "@/server/services/promotionService";

interface PromotionCreateInput extends PromotionInput {
  createdBy: string;
}

/**
 * TEMPLATE METHOD — passos variáveis para o cadastro de uma promoção por tempo
 * determinado (ver ValidatedCreateHandler). createdBy é o id do usuário logado
 * que está criando o registro (enviado pelo cliente a partir da sessão atual).
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
    return promotionService.validate(input);
  }

  protected persist(input: PromotionCreateInput) {
    return promotionService.create(input, input.createdBy);
  }

  protected entityKey() {
    return "promotion";
  }
}

export async function GET() {
  const promotions = await promotionService.list();
  return Response.json({ promotions });
}

export async function POST(request: Request) {
  return new CreatePromotionHandler().handle(request);
}
