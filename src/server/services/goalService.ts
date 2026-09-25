import {goalRepository} from "@/server/repositories/goalRepository";

export interface GoalCreateInput {
  name: string;
  target: number;
  due: string;
}

/** Service — regra de negócio de Goal, reaproveitada pelo POST (create) e pelo PATCH (update). */
export const goalService = {
  list() {
    return goalRepository.list();
  },

  validate(input: GoalCreateInput): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!input.name) errors.name = "Name the goal.";
    if (!(input.target > 0)) errors.target = "Enter a target amount.";
    if (!input.due) errors.due = "Set a deadline.";
    return errors;
  },

  create(input: GoalCreateInput) {
    return goalRepository.create({ id: "g" + Date.now(), name: input.name, target: input.target, current: 0, due: input.due });
  },

  update(id: string, input: GoalCreateInput) {
    return goalRepository.update(id, { name: input.name, target: input.target, due: input.due });
  },

  remove(id: string) {
    return goalRepository.remove(id);
  },
};
