"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppPage } from "@/modules/core/layout/AppPage";
import { Loading } from "@/modules/core/layout/Loading";
import { Card } from "@/design-system/Card";
import { StatCard } from "@/design-system/StatCard";
import { Alert } from "@/design-system/Alert";
import { Button } from "@/design-system/Button";
import { usePlanGating } from "@/modules/plans/gating";
import { useToast } from "@/modules/core/ToastContext";
import { buildChart } from "@/modules/performance/chart";
import { useMarketSeries } from "@/modules/performance/useMarketSeries";
import { PerformanceChart } from "@/modules/performance/components/PerformanceChart";
import { useWallets } from "@/modules/wallets/WalletsContext";
import { usd, pctStr, posColor } from "@/modules/core/format";

const periodOptions: [string, number][] = [
  ["All", 24],
  ["3M", 3],
  ["6M", 6],
  ["12M", 12],
  ["24M", 24],
];

export default function PerformancePage() {
  const gating = usePlanGating();
  const { showToast } = useToast();
  const router = useRouter();
  const { wallets, loading, walletValue } = useWallets();
  const market = useMarketSeries();
  const [period, setPeriod] = useState(12);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const total = wallets.reduce((s, w) => s + walletValue(w.id), 0);

  const effPeriod = gating.isStandard ? Math.min(period, 12) : period;
  const chart = useMemo(() => buildChart(market, effPeriod, 320), [market, effPeriod]);

  if (loading || market.loading) {
    return (
      <AppPage title="Performance" subtitle="Interactive chart with period filters">
        <Loading />
      </AppPage>
    );
  }

  const pd = chart.data;
  const pReturn = pd.length > 1 ? (pd[pd.length - 1] / pd[0] - 1) * 100 : 0;
  let best = 0;
  let worst = 0;
  for (let i = 1; i < pd.length; i++) {
    const c = (pd[i] / pd[i - 1] - 1) * 100;
    if (c > best) best = c;
    if (c < worst) worst = c;
  }
  const benchReturn = (market.benchSeries[23] / market.benchSeries[Math.max(0, 24 - period)] - 1) * 100;

  const selectPeriod = (months: number) => {
    if (gating.periodLocked(months)) {
      showToast("Full history needs Platinum or Black.", "err");
      router.push("/plans");
      return;
    }
    setPeriod(months);
    setHoverIdx(null);
  };

  return (
    <AppPage title="Performance" subtitle="Interactive chart with period filters">
      <div className="flex flex-col gap-4 max-w-[1240px]">
        <Card padding="p-5.5" className="flex flex-col gap-4.5">
          <div className="flex justify-between items-start flex-wrap gap-3.5">
            <div>
              <div className="font-mono text-[30px] font-semibold tracking-tight">{usd(total)}</div>
              <div className="flex gap-2 items-center mt-1.5">
                <span className="bg-[var(--color-success-bg)] text-[var(--color-success-fg)] font-mono text-xs font-semibold px-2 py-0.5 rounded-md">
                  {pctStr(pReturn)}
                </span>
                <span className="text-[13px] text-[var(--color-text-muted)]">over {effPeriod} months</span>
              </div>
            </div>
            <div className="flex gap-1.5 bg-[var(--color-border-3)] p-1 rounded-[10px]">
              {periodOptions.map(([label, months]) => {
                const locked = gating.periodLocked(months);
                const on = period === months && !locked;
                return (
                  <button
                    key={label}
                    onClick={() => selectPeriod(months)}
                    className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg border-none text-[13px] font-semibold cursor-pointer"
                    style={{
                      background: on ? "#ffffff" : "transparent",
                      color: locked ? "#98A2B3" : on ? "#111A2B" : "var(--color-text-muted)",
                      boxShadow: on ? "0 1px 2px rgba(16,24,40,.1)" : "none",
                    }}
                  >
                    {locked && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="10" width="16" height="10" rx="2" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      </svg>
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {gating.isStandard && (
            <Alert
              tone="brand"
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              }
              action={
                <Button size="sm" onClick={() => router.push("/plans")} className="shrink-0 self-center">
                  Upgrade
                </Button>
              }
            >
              Standard charts go back 12 months. Full history and the 24-month filter are available on Platinum.
            </Alert>
          )}

          <PerformanceChart chart={chart} height={320} interactive hoverIdx={hoverIdx} onHover={setHoverIdx} />

          <div className="flex gap-5 border-t border-[var(--color-border-3)] pt-3.5">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted-2)]">
              <span className="w-4 h-[3px] bg-[var(--color-brand)] rounded-sm" />
              My portfolio
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted-2)]">
              <span className="w-4 h-0 border-t-2 border-dashed border-[#98A2B3]" />
              Ibovespa (USD)
            </div>
            <div className="ml-auto text-xs text-[var(--color-text-faint)]">Hover the chart for monthly detail</div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <StatCard label="Period return" value={pctStr(pReturn)} color={posColor(pReturn)} note={`vs +${benchReturn.toFixed(2)}% benchmark`} />
          <StatCard label="Best month" value={pctStr(best)} color="#067647" note="Single-month gain" />
          <StatCard label="Worst month" value={pctStr(worst)} color="#B42318" note="Single-month drawdown" />
          <StatCard label="Monthly volatility" value="2.31%" color="#111A2B" note="Standard deviation" />
        </div>
      </div>
    </AppPage>
  );
}
