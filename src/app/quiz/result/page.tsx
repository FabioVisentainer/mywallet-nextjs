"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuiz } from "@/modules/quiz/QuizContext";
import { useSession } from "@/modules/core/SessionContext";
import { apiFetch } from "@/services/apiClient";
import { profiles } from "@/modules/quiz/data";
import { Card } from "@/design-system/Card";
import { Badge } from "@/design-system/Badge";
import { ProgressBar } from "@/design-system/ProgressBar";
import { Button } from "@/design-system/Button";

const scaleOrder: (keyof typeof profiles)[] = ["Conservative", "Moderate", "Aggressive"];

export default function QuizResultPage() {
  const { score, profileKey, profile, reset, quizAnswers } = useQuiz();
  const { user } = useSession();
  const router = useRouter();
  const saved = useRef(false);

  // Req. 6 — Teste de Perfil de Investidor: cada teste concluído ("realizar"
  // ou "refazer") vira um novo InvestorProfileResult, preservando o histórico.
  useEffect(() => {
    if (saved.current || !user) return;
    saved.current = true;
    apiFetch("/api/quiz/result", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, score, profileKey, answers: quizAnswers }),
    }).catch(() => {
      saved.current = false;
    });
  }, [user, score, profileKey, quizAnswers]);

  const markerLeft = Math.min(96, Math.max(4, score)) + "%";

  const goDashboard = () => {
    router.push("/dashboard");
  };

  const retake = () => {
    reset();
    router.push("/quiz");
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-6 py-14">
      <div className="w-full max-w-[720px] flex flex-col gap-5">
        <div className="bg-[var(--color-ink)] rounded-[18px] p-8.5 text-white flex flex-col gap-4.5">
          <Badge uppercase className="self-start !px-3.5 !py-1.5" style={{ background: "var(--color-ink-2)", color: "#9FC1FF", border: "1px solid var(--color-ink-border-2)" }}>
            Test complete
          </Badge>
          <div>
            <div className="text-[15px] text-[var(--color-ink-muted)]">Your investor profile is</div>
            <div className="text-[42px] font-extrabold tracking-tight mt-1">{profile.name}</div>
          </div>
          <div className="text-[15px] leading-relaxed text-[var(--color-ink-muted-5)] max-w-[580px]">
            {profile.summary} Score {score} of 100.
          </div>
          <div className="flex flex-col gap-2 mt-1">
            <div className="h-2.5 rounded-full relative" style={{ background: "linear-gradient(90deg, #12B76A, #F79009, #F04438)" }}>
              <div
                className="absolute -top-[5px] w-5 h-5 rounded-full bg-white border-4 border-[var(--color-ink)] shadow-[0_0_0_2px_#fff]"
                style={{ left: markerLeft }}
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--color-ink-muted-2)]">
              <span>Conservative</span>
              <span>Moderate</span>
              <span>Aggressive</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mt-1.5">
            {scaleOrder.map((k) => {
              const d = profiles[k];
              const on = k === profileKey;
              return (
                <div
                  key={k}
                  className="rounded-xl p-3.5 border-[1.5px]"
                  style={{ borderColor: on ? "var(--color-brand)" : "var(--color-ink-border)", background: on ? "#16233A" : "transparent" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-bold" style={{ color: on ? "#fff" : "var(--color-ink-muted)" }}>
                      {d.name}
                    </div>
                    {on && (
                      <Badge uppercase className="!bg-[var(--color-brand)] !text-white !px-1.5">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs leading-relaxed mt-1.5" style={{ color: on ? "var(--color-ink-muted-5)" : "var(--color-ink-muted-3)" }}>
                    {d.short}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--color-ink-muted-2)] mt-2">{d.range}</div>
                </div>
              );
            })}
          </div>
        </div>

        <Card padding="p-6" className="rounded-2xl flex flex-col gap-4">
          <div className="text-base font-bold">Suggested allocation</div>
          {profile.alloc.map((a) => (
            <div key={a.label} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{a.label}</span>
                <span className="font-mono text-[var(--color-text-muted-2)]">{a.pct}</span>
              </div>
              <ProgressBar value={parseFloat(a.pct)} color={a.color} />
            </div>
          ))}
          <div className="text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-3.5">
            Reference allocation only. MyWallet does not provide personalised investment advice.
          </div>
        </Card>

        <div className="flex gap-3">
          <Button onClick={goDashboard} size="lg">
            Go to dashboard
          </Button>
          <Button variant="secondary" onClick={retake} size="lg">
            Retake test
          </Button>
        </div>
      </div>
    </div>
  );
}
