"use client";

import { useState } from "react";
import { AppPage } from "@/modules/core/components/AppPage";
import { Loading } from "@/modules/core/components/Loading";
import { Card } from "@/modules/core/components/Card";
import { Badge } from "@/modules/core/components/Badge";
import { Button } from "@/modules/core/components/Button";
import { useSession } from "@/modules/core/SessionContext";
import { usePromotions } from "@/modules/promotions/PromotionsContext";
import { PromotionFormModal } from "@/modules/promotions/components/PromotionFormModal";
import { useToast } from "@/modules/core/ToastContext";
import { useConfirm } from "@/modules/core/ConfirmContext";
import type { BadgeTone } from "@/modules/core/components/Badge";
import type { Promotion, PromotionInput } from "@/modules/promotions/types";

const emptyInput: PromotionInput = { planName: "Platinum", title: "", description: "", discountPct: "", startsAt: "", endsAt: "" };

/** Vigência calculada a partir de startsAt/endsAt (datas "YYYY-MM-DD", comparáveis como string) e da flag active. */
function statusOf(p: Promotion): { label: string; tone: BadgeTone } {
  if (!p.active) return { label: "Deactivated", tone: "neutral" };
  const today = new Date().toISOString().slice(0, 10);
  if (today < p.startsAt) return { label: "Scheduled", tone: "brand" };
  if (today > p.endsAt) return { label: "Expired", tone: "neutral" };
  return { label: "Active", tone: "success" };
}

export default function PromotionsPage() {
  const { user } = useSession();
  const { promotions, loading, addPromotion, updatePromotion, setActive, deletePromotion } = usePromotions();
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const [modalTarget, setModalTarget] = useState<{ id?: string; initial: PromotionInput } | null>(null);

  if (loading) {
    return (
      <AppPage title="Promotions" subtitle="Time-limited discounts on subscription plans">
        <Loading />
      </AppPage>
    );
  }

  const handleSave = async (input: PromotionInput) => {
    if (modalTarget?.id) {
      await updatePromotion(modalTarget.id, input);
      showToast("Promotion updated.");
    } else {
      await addPromotion(input, user?.id ?? "unknown");
      showToast("Promotion created.");
    }
    setModalTarget(null);
  };

  return (
    <AppPage title="Promotions" subtitle="Time-limited discounts on subscription plans">
      <div className="flex flex-col gap-4 max-w-[1000px]">
        <div className="flex justify-between items-center">
          <div className="text-[13px] text-[var(--color-text-muted)]">{promotions.length} promotions on record</div>
          <Button onClick={() => setModalTarget({ initial: emptyInput })}>+ New promotion</Button>
        </div>

        {promotions.map((p) => {
          const status = statusOf(p);
          return (
            <Card key={p.id} className="flex gap-5.5 items-center">
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="text-[15px] font-bold">{p.title}</div>
                  <Badge tone="purple">{p.planName}</Badge>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
                <div className="text-[13px] text-[var(--color-text-muted-2)]">{p.description}</div>
                <div className="text-xs text-[var(--color-text-muted)] font-mono">
                  {p.startsAt} → {p.endsAt}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-2xl font-semibold">{p.discountPct}%</div>
                <div className="text-[11px] text-[var(--color-text-faint)]">discount</div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setModalTarget({ id: p.id, initial: { planName: p.planName, title: p.title, description: p.description, discountPct: String(p.discountPct), startsAt: p.startsAt, endsAt: p.endsAt } })}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setActive(p.id, !p.active)
                      .then(() => showToast(p.active ? "Promotion deactivated." : "Promotion reactivated."))
                      .catch(() => showToast("Could not update the promotion.", "err"))
                  }
                >
                  {p.active ? "Deactivate" : "Reactivate"}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    askConfirm({
                      title: `Delete "${p.title}"?`,
                      body: "This permanently removes the promotion. It stops applying to any new subscription immediately.",
                      detail: `${p.planName} · ${p.discountPct}% · ${p.startsAt} → ${p.endsAt}`,
                      cta: "Delete promotion",
                      onConfirm: () => {
                        deletePromotion(p.id)
                          .then(() => showToast(`Promotion "${p.title}" deleted.`))
                          .catch(() => showToast("Could not delete the promotion.", "err"));
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
        {promotions.length === 0 && <div className="py-12 text-center text-[var(--color-text-muted)] text-sm">No promotions yet.</div>}
      </div>

      {modalTarget && (
        <PromotionFormModal
          title={modalTarget.id ? "Edit promotion" : "New promotion"}
          initial={modalTarget.initial}
          onSave={handleSave}
          onClose={() => setModalTarget(null)}
        />
      )}
    </AppPage>
  );
}
