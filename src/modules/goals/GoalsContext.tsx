"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Goal, GoalInput } from "./types";
import { goalsService } from "./goalsService";

interface GoalsContextValue {
  goals: Goal[];
  loading: boolean;
  getGoal: (id: string) => Goal | undefined;
  addGoal: (input: GoalInput) => Promise<void>;
  updateGoal: (id: string, input: GoalInput) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

const GoalsContext = createContext<GoalsContextValue | null>(null);

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    goalsService
      .list()
      .then((data) => setGoals(data.goals))
      .finally(() => setLoading(false));
  }, []);

  const getGoal = useCallback((id: string) => goals.find((g) => g.id === id), [goals]);

  const addGoal = useCallback(async (input: GoalInput) => {
    const { goal } = await goalsService.create(input);
    setGoals((gs) => gs.concat([goal]));
  }, []);

  const updateGoal = useCallback(async (id: string, input: GoalInput) => {
    const { goal } = await goalsService.update(id, input);
    setGoals((gs) => gs.map((g) => (g.id === id ? goal : g)));
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await goalsService.remove(id);
    setGoals((gs) => gs.filter((g) => g.id !== id));
  }, []);

  const value = useMemo<GoalsContextValue>(
    () => ({ goals, loading, getGoal, addGoal, updateGoal, deleteGoal }),
    [goals, loading, getGoal, addGoal, updateGoal, deleteGoal]
  );

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

export function useGoals(): GoalsContextValue {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error("useGoals must be used within GoalsProvider");
  return ctx;
}
