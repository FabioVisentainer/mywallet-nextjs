import type {PlanName} from "@/modules/core/types";

export interface Promotion {
  id: string;
  planName: PlanName;
  title: string;
  description: string;
  discountPct: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  createdBy: string;
}

export interface PromotionInput {
  planName: PlanName;
  title: string;
  description: string;
  discountPct: string;
  startsAt: string;
  endsAt: string;
}
