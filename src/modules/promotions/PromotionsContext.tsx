"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Promotion, PromotionInput } from "./types";
import { apiFetch } from "@/lib/apiClient";

interface PromotionsContextValue {
  promotions: Promotion[];
  loading: boolean;
  addPromotion: (input: PromotionInput, createdBy: string) => Promise<void>;
  updatePromotion: (id: string, input: PromotionInput) => Promise<void>;
  setActive: (id: string, active: boolean) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
}

const PromotionsContext = createContext<PromotionsContextValue | null>(null);

export function PromotionsProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ promotions: Promotion[] }>("/api/promotions")
      .then((data) => setPromotions(data.promotions))
      .finally(() => setLoading(false));
  }, []);

  const addPromotion = useCallback(async (input: PromotionInput, createdBy: string) => {
    const { promotion } = await apiFetch<{ promotion: Promotion }>("/api/promotions", {
      method: "POST",
      body: JSON.stringify({ ...input, createdBy }),
    });
    setPromotions((ps) => [promotion, ...ps]);
  }, []);

  const updatePromotion = useCallback(async (id: string, input: PromotionInput) => {
    const { promotion } = await apiFetch<{ promotion: Promotion }>(`/api/promotions/${id}`, { method: "PATCH", body: JSON.stringify(input) });
    setPromotions((ps) => ps.map((p) => (p.id === id ? promotion : p)));
  }, []);

  const setActive = useCallback(
    async (id: string, active: boolean) => {
      const current = promotions.find((p) => p.id === id);
      if (!current) return;
      const { promotion } = await apiFetch<{ promotion: Promotion }>(`/api/promotions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          planName: current.planName,
          title: current.title,
          description: current.description,
          discountPct: current.discountPct,
          startsAt: current.startsAt,
          endsAt: current.endsAt,
          active,
        }),
      });
      setPromotions((ps) => ps.map((p) => (p.id === id ? promotion : p)));
    },
    [promotions]
  );

  const deletePromotion = useCallback(async (id: string) => {
    await apiFetch(`/api/promotions/${id}`, { method: "DELETE" });
    setPromotions((ps) => ps.filter((p) => p.id !== id));
  }, []);

  const value = useMemo<PromotionsContextValue>(
    () => ({ promotions, loading, addPromotion, updatePromotion, setActive, deletePromotion }),
    [promotions, loading, addPromotion, updatePromotion, setActive, deletePromotion]
  );

  return <PromotionsContext.Provider value={value}>{children}</PromotionsContext.Provider>;
}

export function usePromotions(): PromotionsContextValue {
  const ctx = useContext(PromotionsContext);
  if (!ctx) throw new Error("usePromotions must be used within PromotionsProvider");
  return ctx;
}
