"use client";

import Link from "next/link";
import {AppPage} from "@/modules/core/layout/AppPage";
import {Button, Card, ProgressBar, StatCard} from "@fabiovisentainer/design-system";
import {Loading} from "@/modules/core/layout/Loading";
import {useWallets} from "@/modules/wallets/WalletsContext";
import {useGoals} from "@/modules/goals/GoalsContext";
import {usePlanGating} from "@/modules/plans/gating";
import {useCurrencyRates} from "@/modules/plans/useCurrencyRates";
import {cur, pctStr, posColor, usd} from "@/modules/core/format";
import {buildChart} from "@/modules/performance/chart";
import {useMarketSeries} from "@/modules/performance/useMarketSeries";
import {useEconomicCalendar} from "@/modules/performance/useEconomicCalendar";
import {PerformanceChart} from "@/modules/performance/components/PerformanceChart";

const impactColor: Record<string, string> = {
  High: "var(--color-danger-fg)",
  Medium: "var(--color-warning-fg)",
  Low: "var(--color-text-muted)",
};

export default function DashboardPage() {
  const { wallets, loading, walletValue, walletCost, getAssets } = useWallets();
  const { goals } = useGoals();
  const gating = usePlanGating();
  const { rates: currencyDefs } = useCurrencyRates();
  const market = useMarketSeries();
  const { events: economicEvents } = useEconomicCalendar();

  const total = wallets.reduce((s, w) => s + walletValue(w.id), 0);
  const totalCost = wallets.reduce((s, w) => s + walletCost(w.id), 0);
  const pl = total - totalCost;

  if (loading || market.loading) {
    return (
      <AppPage title="Overview" subtitle="Consolidated position across all wallets">
        <Loading />
      </AppPage>
    );
  }

  const dash = buildChart(market, 12, 260);

  return (
    <AppPage title="Overview" subtitle="Consolidated position across all wallets">
      <div className="flex flex-col gap-4.5 max-w-[1240px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5" style={{ gridTemplateColumns: "1.3fr 1fr 1fr 1fr" }}>
          <div className="bg-[var(--color-ink)] rounded-[14px] p-5 text-white">
            <div className="text-xs text-[var(--color-ink-muted)] font-semibold">Total net worth</div>
            <div className="font-mono text-[30px] font-semibold tracking-tight mt-2">{usd(total)}</div>
            <div className="flex gap-2 items-center mt-2.5">
              <span className="bg-[var(--color-success-dark-bg)] text-[var(--color-success-dark-fg)] font-mono text-xs font-semibold px-2 py-0.5 rounded-md">
                +14.62%
              </span>
              <span className="text-xs text-[var(--color-ink-muted-2)]">last 12 months</span>
            </div>
          </div>
          <StatCard label="Invested cost" value={usd(totalCost, 0)} delta={`Across ${wallets.length} wallets`} />
          <StatCard
            label="Unrealised P/L"
            value={(pl >= 0 ? "+" : "−") + usd(Math.abs(pl))}
            delta={pctStr((total / (totalCost || 1) - 1) * 100) + " all time"}
            color={posColor(pl)}
          />
          <StatCard label="Best position" value="PETR4" delta="+19.93% since entry" color="#067647" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3.5">
          <Card className="flex flex-col gap-3.5">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[15px] font-bold">Portfolio performance</div>
                <div className="text-xs text-[var(--color-text-muted)]">Last 12 months · USD</div>
              </div>
              <Button href="/performance" variant="secondary" size="sm">
                Open chart
              </Button>
            </div>
            <PerformanceChart chart={dash} height={260} />
          </Card>

          <Card className="flex flex-col gap-3.5">
            <div className="text-[15px] font-bold">Value across currencies</div>
            {currencyDefs.map((c) => {
              const locked = gating.currencyLocked(c.code);
              return (
                <div key={c.code} className="flex justify-between items-center py-2.5 border-b border-[var(--color-border-3)]" style={{ opacity: locked ? 0.72 : 1 }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-[30px] h-[30px] rounded-lg bg-[var(--color-border-3)] grid place-items-center text-[13px] font-bold text-[var(--color-text-muted-2)]">
                      {c.symbol}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold">{c.code}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">{c.name}</div>
                    </div>
                  </div>
                  {locked ? (
                    <Link
                      href="/plans"
                      className="flex items-center gap-1.5 border border-[var(--color-border)] bg-[var(--color-card-alt)] rounded-full px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="10" width="16" height="10" rx="2" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      </svg>
                      Platinum
                    </Link>
                  ) : (
                    <div className="font-mono text-sm">{cur(total * c.rate, c.code)}</div>
                  )}
                </div>
              );
            })}
            <div className="text-[11px] text-[var(--color-text-faint)]">
              {gating.isStandard ? "Standard shows USD only — multi-currency indicators are part of Platinum." : "Rates refreshed 11 Aug 2026, 14:32 UTC."}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3.5">
          <Card className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="text-[15px] font-bold">Your wallets</div>
              <Link href="/wallets" className="bg-transparent border-none text-[var(--color-brand)] font-semibold text-[13px]">
                Manage all
              </Link>
            </div>
            {wallets.map((w) => {
              const val = walletValue(w.id);
              const cost = walletCost(w.id);
              const chg = cost ? (val / cost - 1) * 100 : 0;
              return (
                <Link
                  key={w.id}
                  href={`/wallets/${w.id}`}
                  className="flex items-center gap-3.5 p-3 rounded-[11px] border border-[var(--color-border)] bg-white hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft-bg)]"
                >
                  <div className="w-9 h-9 rounded-[10px] grid place-items-center text-sm" style={{ background: w.tint, color: w.tintFg }}>
                    {w.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{w.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {getAssets(w.id).length} assets · {w.kind}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold">{usd(val)}</div>
                    <div className="font-mono text-xs" style={{ color: posColor(chg) }}>
                      {pctStr(chg)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </Card>

          <Card className="flex flex-col gap-3.5">
            <div className="flex justify-between items-center">
              <div className="text-[15px] font-bold">Goals</div>
              <Link href="/goals" className="bg-transparent border-none text-[var(--color-brand)] font-semibold text-[13px]">
                All goals
              </Link>
            </div>
            {goals.map((g) => {
              const p = Math.min(100, (g.current / g.target) * 100);
              return (
                <div key={g.id} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[13px]">
                    <span className="font-semibold">{g.name}</span>
                    <span className="font-mono text-[var(--color-text-muted-2)]">{p.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={p} height="h-[7px]" />
                  <div className="text-[11px] text-[var(--color-text-muted)] font-mono">
                    {usd(g.current, 0)} / {usd(g.target, 0)}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        <Card className="flex flex-col gap-3">
          <div className="text-[15px] font-bold">Economic calendar</div>
          {economicEvents.map((e, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--color-border-3)] last:border-b-0 text-[13px]">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[11px] text-[var(--color-text-muted)] w-9">{e.country}</span>
                <span className="font-semibold">{e.indicator}</span>
              </div>
              <div className="flex items-center gap-3.5">
                <span className="font-mono text-xs text-[var(--color-text-muted)]">{e.date}</span>
                <span className="font-mono text-xs font-semibold" style={{ color: impactColor[e.impact] }}>
                  {e.impact}
                </span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </AppPage>
  );
}
