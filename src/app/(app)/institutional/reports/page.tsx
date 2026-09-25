"use client";

import {AppPage} from "@/modules/core/layout/AppPage";
import {Loading} from "@/modules/core/layout/Loading";
import {Alert, Button, Card, StatCard} from "@fabiovisentainer/design-system";
import {useWallets} from "@/modules/wallets/WalletsContext";
import {useInstitutionalAccess} from "@/modules/institutional/access";
import {useToast} from "@/modules/core/ToastContext";
import {pctStr, posColor, usd} from "@/modules/core/format";
import {getReportExportStrategy} from "@/modules/institutional/reportExportStrategy";

export default function InstitutionalReportsPage() {
  const { isInstitutional } = useInstitutionalAccess();
  const { wallets, loading, walletValue, walletCost } = useWallets();
  const { showToast } = useToast();

  if (!isInstitutional) {
    return (
      <AppPage title="Consolidated report" subtitle="Exclusive to institutional accounts" backHref="/institutional">
        <Alert tone="warning" title="This module isn't part of your account.">
          Consolidated, multi-wallet compliance reporting is a module only some MyWallet clients have, independent of your plan.
        </Alert>
      </AppPage>
    );
  }

  if (loading) {
    return (
      <AppPage title="Consolidated report" subtitle="All wallets on this desk, aggregated" backHref="/institutional">
        <Loading />
      </AppPage>
    );
  }

  const rows = wallets.map((w) => {
    const value = walletValue(w.id);
    const cost = walletCost(w.id);
    const pnl = cost > 0 ? ((value - cost) / cost) * 100 : 0;
    return { wallet: w, value, cost, pnl };
  });
  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const totalPnl = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  const exportFacade = (kind: "CSV" | "PDF") => {
    const strategy = getReportExportStrategy(kind);
    const payload = strategy.build(rows.map((r) => ({ wallet: r.wallet.name, value: r.value, cost: r.cost, pnl: r.pnl })));
    const lineCount = payload.split("\n").length;
    showToast(`${strategy.label} report generated (${lineCount} lines) — a compliance officer will receive it by email. (Demo — no file is generated.)`);
  };

  return (
    <AppPage title="Consolidated report" subtitle="All wallets on this desk, aggregated" backHref="/institutional">
      <div className="flex flex-col gap-4 max-w-[1000px]">
        <Alert tone="brand">This screen is exclusive to Institutional-segment clients — it aggregates every wallet into one compliance-ready view.</Alert>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Consolidated market value" value={usd(totalValue, 0)} />
          <StatCard label="Consolidated cost basis" value={usd(totalCost, 0)} />
          <StatCard label="Consolidated P&L" value={pctStr(totalPnl)} color={posColor(totalPnl)} />
        </div>

        <Card padding="p-0" className="overflow-hidden">
          <div
            className="grid gap-3 px-5 py-2.5 bg-[var(--color-card-alt)] border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}
          >
            <div>Wallet</div>
            <div>Market value</div>
            <div>Cost basis</div>
            <div>P&L</div>
          </div>
          {rows.map((r) => (
            <div
              key={r.wallet.id}
              className="grid gap-3 px-5 py-3.5 border-b border-[var(--color-border-3)] items-center"
              style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}
            >
              <div className="text-sm font-semibold">{r.wallet.name}</div>
              <div className="font-mono text-sm">{usd(r.value, 0)}</div>
              <div className="font-mono text-sm text-[var(--color-text-muted-2)]">{usd(r.cost, 0)}</div>
              <div className="font-mono text-sm font-semibold" style={{ color: posColor(r.pnl) }}>
                {pctStr(r.pnl)}
              </div>
            </div>
          ))}
          {rows.length === 0 && <div className="py-12 text-center text-[var(--color-text-muted)] text-sm">No wallets to consolidate yet.</div>}
        </Card>

        <div className="flex gap-2.5 justify-end">
          <Button variant="secondary" onClick={() => exportFacade("CSV")}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => exportFacade("PDF")}>
            Export PDF
          </Button>
        </div>
      </div>
    </AppPage>
  );
}
