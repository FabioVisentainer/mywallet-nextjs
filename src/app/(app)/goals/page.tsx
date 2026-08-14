"use client";

import { useState } from "react";
import { AppPage } from "@/modules/core/components/AppPage";
import { Loading } from "@/modules/core/components/Loading";
import { Card } from "@/modules/core/components/Card";
import { Badge } from "@/modules/core/components/Badge";
import { Button } from "@/modules/core/components/Button";
import { ProgressBar } from "@/modules/core/components/ProgressBar";
import { useGoals } from "@/modules/goals/GoalsContext";
import { GoalFormModal } from "@/modules/goals/components/GoalFormModal";
import { usePlanGating } from "@/modules/plans/gating";
import { LockedFeature } from "@/modules/plans/components/LockedFeature";
import { useToast } from "@/modules/core/ToastContext";
import { useConfirm } from "@/modules/core/ConfirmContext";
import { usd } from "@/modules/core/format";
import type { BadgeTone } from "@/modules/core/components/Badge";
import type { GoalInput } from "@/modules/goals/types";

export default function GoalsPage() {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useGoals();
  const gating = usePlanGating();
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const [modalTarget, setModalTarget] = useState<{ id?: string; initial: GoalInput } | null>(null);

  if (gating.goalsLocked) {
    return (
      <AppPage title="Financial goals" subtitle="Track targets and deadlines">
        <LockedFeature
          title="Financial goals are a paid feature"
          body="Set targets with amounts and deadlines, and MyWallet tracks how close your portfolio is to each one."
          bullets={["Unlimited goals with target amount and deadline", "Monthly contribution needed, recalculated daily", "Progress alerts when a goal falls behind"]}
        />
      </AppPage>
    );
  }

  if (loading) {
    return (
      <AppPage title="Financial goals" subtitle="Track targets and deadlines">
        <Loading />
      </AppPage>
    );
  }

  const combinedTarget = goals.reduce((s, g) => s + g.target, 0);

  const handleSave = async (input: GoalInput) => {
    if (modalTarget?.id) {
      await updateGoal(modalTarget.id, input);
      showToast("Goal updated.");
    } else {
      await addGoal(input);
      showToast("Goal created.");
    }
    setModalTarget(null);
  };

  return (
    <AppPage title="Financial goals" subtitle="Track targets and deadlines">
      <div className="flex flex-col gap-4 max-w-[1000px]">
        <div className="flex justify-between items-center">
          <div className="text-[13px] text-[var(--color-text-muted)]">
            {goals.length} active goals · {usd(combinedTarget, 0)} combined target
          </div>
          <Button onClick={() => setModalTarget({ initial: { name: "", target: "", due: "" } })}>+ New goal</Button>
        </div>

        {goals.map((g) => {
          const p = Math.min(100, (g.current / g.target) * 100);
          const done = p >= 100;
          const status = done ? "Reached" : p > 40 ? "On track" : "Behind";
          const tone: BadgeTone = done ? "success" : p > 40 ? "brand" : "warning";
          const barColor = done ? "#12B76A" : p > 40 ? "#2563EB" : "#F79009";
          const monthly = Math.max(0, (g.target - g.current) / 18);

          return (
            <Card key={g.id} className="flex gap-5.5 items-center">
              <div className="flex-1 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="text-[15px] font-bold">{g.name}</div>
                  <Badge tone={tone}>{status}</Badge>
                </div>
                <ProgressBar value={p} color={barColor} height="h-[9px]" />
                <div className="flex gap-5.5 text-xs text-[var(--color-text-muted)]">
                  <span className="font-mono">
                    {usd(g.current, 0)} of {usd(g.target, 0)}
                  </span>
                  <span>Due {g.due}</span>
                  <span>{usd(monthly, 0)} / month needed</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-2xl font-semibold">{p.toFixed(0)}%</div>
                <div className="text-[11px] text-[var(--color-text-faint)]">complete</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setModalTarget({ id: g.id, initial: { name: g.name, target: String(g.target), due: g.due } })}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    askConfirm({
                      title: `Delete "${g.name}"?`,
                      body: "Progress tracking for this goal is removed. Your wallets and balances are unaffected.",
                      detail: `${usd(g.current, 0)} of ${usd(g.target, 0)} · due ${g.due}`,
                      cta: "Delete goal",
                      onConfirm: () => {
                        deleteGoal(g.id)
                          .then(() => showToast(`Goal "${g.name}" deleted.`))
                          .catch(() => showToast("Could not delete the goal.", "err"));
                      },
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {modalTarget && (
        <GoalFormModal
          title={modalTarget.id ? "Edit goal" : "New financial goal"}
          initial={modalTarget.initial}
          onSave={handleSave}
          onClose={() => setModalTarget(null)}
        />
      )}
    </AppPage>
  );
}
