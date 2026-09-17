"use client";

import { AppPage } from "@/modules/core/layout/AppPage";
import { Card } from "@/design-system/Card";
import { Badge } from "@/design-system/Badge";
import { Button } from "@/design-system/Button";
import { useSession } from "@/modules/core/SessionContext";
import { useToast } from "@/modules/core/ToastContext";
import { planDefs, planMatrixDefs } from "@/modules/plans/data";
import type { PlanName } from "@/modules/core/types";

const planOrder: PlanName[] = ["Standard", "Platinum", "Black"];

function cellColor(v: string) {
  return v === "✓" ? "var(--color-success-fg)" : v === "—" ? "var(--color-text-faint)" : "var(--color-text-muted-3)";
}

export default function PlansPage() {
  const { plan, setPlan } = useSession();
  const { showToast } = useToast();
  const currentIndex = planOrder.indexOf(plan);

  return (
    <AppPage title="Plans & billing" subtitle="Compare Standard, Platinum and Black">
      <div className="flex flex-col gap-5.5 max-w-[1180px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {planDefs.map((p, i) => {
            const current = p.name === plan;
            const recommended = !!p.recommended && !current;
            const dark = !!p.dark;
            return (
              <Card
                key={p.name}
                padding="p-6.5"
                className="relative rounded-[18px] flex flex-col gap-4.5"
                style={{
                  background: dark ? "var(--color-ink)" : "#ffffff",
                  borderWidth: "1.5px",
                  borderColor: current ? "var(--color-brand)" : dark ? "var(--color-ink)" : "var(--color-border)",
                  color: dark ? "#ffffff" : "var(--color-text)",
                  boxShadow: current ? "0 8px 28px rgba(37,99,235,.14)" : "none",
                }}
              >
                {current && (
                  <Badge tone="brand" uppercase className="absolute -top-2.5 left-6.5 !bg-[var(--color-brand)] !text-white">
                    Current plan
                  </Badge>
                )}
                {recommended && (
                  <Badge tone="success" uppercase className="absolute -top-2.5 right-6.5 !bg-[var(--color-success)] !text-white">
                    Most popular
                  </Badge>
                )}

                <div>
                  <div className="text-[19px] font-extrabold tracking-tight">{p.name}</div>
                  <div className="text-[13px] mt-1" style={{ color: dark ? "var(--color-ink-muted-2)" : "var(--color-text-muted)" }}>
                    {p.tagline}
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <div className="font-mono text-[32px] font-semibold tracking-tight">{p.price}</div>
                  <div className="text-[13px]" style={{ color: dark ? "var(--color-ink-muted-2)" : "var(--color-text-muted)" }}>
                    {p.per}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 flex-1">
                  {p.features.map((f) => (
                    <div key={f} className="flex gap-2.5 items-start text-[13px] leading-snug" style={{ color: dark ? "var(--color-ink-muted-5)" : "var(--color-text-muted-3)" }}>
                      <span
                        className="w-[18px] h-[18px] rounded-full grid place-items-center text-[10px] font-bold shrink-0 mt-0.5"
                        style={{ background: dark ? "var(--color-ink-2)" : "var(--color-success-bg)", color: dark ? "var(--color-success-dark-fg)" : "var(--color-success-fg)" }}
                      >
                        ✓
                      </span>
                      {f}
                    </div>
                  ))}
                </div>

                <Button
                  disabled={current}
                  onClick={() => {
                    if (current) return;
                    setPlan(p.name);
                    showToast(i < currentIndex ? `Plan changed to ${p.name}.` : `Upgraded to ${p.name}. All features unlocked.`);
                  }}
                  style={{
                    background: current ? "var(--color-border-3)" : dark ? "#ffffff" : "var(--color-brand)",
                    color: current ? "var(--color-text-muted)" : dark ? "var(--color-ink)" : "#ffffff",
                  }}
                >
                  {current ? "Current plan" : i < currentIndex ? `Switch to ${p.name}` : `Upgrade to ${p.name}`}
                </Button>
              </Card>
            );
          })}
        </div>

        <Card padding="p-0" className="rounded-2xl overflow-hidden">
          <div
            className="grid gap-3 px-5.5 py-3.5 bg-[var(--color-card-alt)] border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}
          >
            <div>Feature</div>
            <div className="text-center">Standard</div>
            <div className="text-center">Platinum</div>
            <div className="text-center">Black</div>
          </div>
          {planMatrixDefs.map((row) => (
            <div key={row[0]} className="grid gap-3 px-5.5 py-3.5 border-b border-[var(--color-border-3)] items-center" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
              <div className="text-[13px] font-semibold">{row[0]}</div>
              <div className="text-center font-mono text-[13px]" style={{ color: cellColor(row[1]) }}>
                {row[1]}
              </div>
              <div className="text-center font-mono text-[13px]" style={{ color: cellColor(row[2]) }}>
                {row[2]}
              </div>
              <div className="text-center font-mono text-[13px]" style={{ color: cellColor(row[3]) }}>
                {row[3]}
              </div>
            </div>
          ))}
          <div className="px-5.5 py-3.5 text-xs text-[var(--color-text-muted)]">
            Plans are billed monthly and can be cancelled at any time. Downgrading keeps your data — features are locked, never deleted.
          </div>
        </Card>
      </div>
    </AppPage>
  );
}
