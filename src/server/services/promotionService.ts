import {promotionRepository} from "@/server/repositories/promotionRepository";

const PLAN_NAMES = ["Standard", "Platinum", "Black"];

export interface PromotionInput {
  planName: string;
  title: string;
  description: string;
  discountPct: number;
  startsAt: string;
  endsAt: string;
}

/** Service — regra de negócio de Promotion, reaproveitada pelo POST e pelo PATCH. */
export const promotionService = {
  list() {
    return promotionRepository.list();
  },

  validate(input: PromotionInput): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!PLAN_NAMES.includes(input.planName)) errors.planName = "Pick a plan.";
    if (!input.title) errors.title = "Give the promotion a title.";
    if (!input.description) errors.description = "Describe the promotion.";
    if (!(input.discountPct > 0 && input.discountPct <= 100)) errors.discountPct = "Enter a discount between 1 and 100%.";
    if (!input.startsAt) errors.startsAt = "Set a start date.";
    if (!input.endsAt) errors.endsAt = "Set an end date.";
    if (input.startsAt && input.endsAt && input.endsAt < input.startsAt) errors.endsAt = "The end date must be on or after the start date.";
    return errors;
  },

  create(input: PromotionInput, createdBy: string) {
    return promotionRepository.create({
      id: "promo" + Date.now(),
      planName: input.planName,
      title: input.title,
      description: input.description,
      discountPct: input.discountPct,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      active: true,
      createdBy: createdBy || "unknown",
    });
  },

  update(id: string, input: PromotionInput, active?: boolean) {
    return promotionRepository.update(id, { ...input, active });
  },

  remove(id: string) {
    return promotionRepository.remove(id);
  },
};
