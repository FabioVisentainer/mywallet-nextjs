"use client";

import {useRouter} from "next/navigation";
import {useToast} from "@/modules/core/ToastContext";
import {Button, ProgressBar} from "@fabiovisentainer/design-system";
import {useQuiz} from "@/modules/quiz/QuizContext";
import {quiz} from "@/modules/quiz/data";

export default function QuizPage() {
  const { quizIdx, quizAnswers, answer, next, back } = useQuiz();
  const { showToast } = useToast();
  const router = useRouter();

  const qi = Math.min(quizIdx, quiz.length - 1);
  const current = quiz[qi];
  const answered = quizAnswers[qi];
  const pct = Math.round((qi / quiz.length) * 100);

  const goNext = () => {
    if (answered === undefined) {
      showToast("Pick an option to continue.", "err");
      return;
    }
    if (qi === quiz.length - 1) router.push("/quiz/result");
    else next();
  };

  const goBack = () => {
    if (qi === 0) router.push("/signup");
    else back();
  };

  const skip = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-16 border-b border-[var(--color-border)] bg-white flex items-center justify-between px-7">
        <div className="flex items-center gap-2.5 font-extrabold">
          <div className="w-[26px] h-[26px] rounded-lg bg-[var(--color-brand)] text-white grid place-items-center text-[13px]">M</div>
          MyWallet
        </div>
        <div className="text-[13px] text-[var(--color-text-muted)]">Investor profile test</div>
        <Button variant="ghost" size="sm" onClick={skip} className="!px-0">
          Skip for now
        </Button>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-[640px] flex flex-col gap-6.5">
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between text-[13px] text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text)]">
                Question {qi + 1} of {quiz.length}
              </span>
              <span>{pct}% complete</span>
            </div>
            <ProgressBar value={pct} height="h-1.5" />
          </div>

          <div className="text-[26px] font-extrabold tracking-tight leading-[1.25] text-pretty">{current.q}</div>

          <div className="flex flex-col gap-2.5">
            {current.o.map((label, i) => {
              const on = answered === i;
              return (
                <button
                  key={i}
                  onClick={() => answer(qi, i)}
                  className="flex items-center gap-3.5 text-left px-4.5 py-4 rounded-xl border-[1.5px] cursor-pointer hover:border-[var(--color-brand)]"
                  style={{ borderColor: on ? "var(--color-brand)" : "var(--color-border)", background: on ? "var(--color-brand-soft-bg)" : "#fff" }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 grid place-items-center shrink-0"
                    style={{ borderColor: on ? "var(--color-brand)" : "#D0D5DD" }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: on ? "var(--color-brand)" : "transparent" }} />
                  </div>
                  <span className="text-[15px] font-medium">{label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-1.5">
            <Button variant="secondary" onClick={goBack}>
              Back
            </Button>
            <Button onClick={goNext} style={{ background: answered === undefined ? "#98A2B3" : "var(--color-brand)" }}>
              {qi === quiz.length - 1 ? "See my profile" : "Next question"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
