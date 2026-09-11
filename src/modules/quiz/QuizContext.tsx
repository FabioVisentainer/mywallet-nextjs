"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { quiz, type InvestorProfile } from "./data";
import { resolveInvestorProfile } from "./profileStrategy";

interface QuizContextValue {
  quizIdx: number;
  quizAnswers: Record<number, number>;
  answer: (idx: number, optionIndex: number) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
  score: number;
  profileKey: "Conservative" | "Moderate" | "Aggressive";
  profile: InvestorProfile;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  const answer = useCallback((idx: number, optionIndex: number) => {
    setQuizAnswers((a) => ({ ...a, [idx]: optionIndex }));
  }, []);

  const next = useCallback(() => setQuizIdx((i) => Math.min(quiz.length - 1, i + 1)), []);
  const back = useCallback(() => setQuizIdx((i) => Math.max(0, i - 1)), []);
  const reset = useCallback(() => {
    setQuizIdx(0);
    setQuizAnswers({});
  }, []);

  const { score, profileKey, profile } = useMemo(() => {
    let raw = 0;
    for (let i = 0; i < quiz.length; i++) raw += quizAnswers[i] === undefined ? 1 : quizAnswers[i];
    const s = Math.round((raw / (quiz.length * 3)) * 100);
    const strategy = resolveInvestorProfile(s);
    return { score: s, profileKey: strategy.key, profile: strategy.profile };
  }, [quizAnswers]);

  const value = useMemo<QuizContextValue>(
    () => ({ quizIdx, quizAnswers, answer, next, back, reset, score, profileKey, profile }),
    [quizIdx, quizAnswers, answer, next, back, reset, score, profileKey, profile]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within QuizProvider");
  return ctx;
}
