"use client";

import { useState } from "react";
import { AppPage } from "@/modules/core/components/AppPage";
import { Loading } from "@/modules/core/components/Loading";
import { Card } from "@/modules/core/components/Card";
import { Badge } from "@/modules/core/components/Badge";
import { Button } from "@/modules/core/components/Button";
import { usePlanGating } from "@/modules/plans/gating";
import { LockedFeature } from "@/modules/plans/components/LockedFeature";
import { useToast } from "@/modules/core/ToastContext";
import { useConfirm } from "@/modules/core/ConfirmContext";
import { typeStyle, type TxInput, type TxType } from "@/modules/transactions/data";
import { useTransactions } from "@/modules/transactions/useTransactions";
import { BrokerImportPanel } from "@/modules/transactions/components/BrokerImportPanel";
import { TransactionFormModal } from "@/modules/transactions/components/TransactionFormModal";
import { usd, posColor } from "@/modules/core/format";

const filters: (TxType | "All")[] = ["All", "Buy", "Sell", "Swap", "Deposit"];

const emptyInput: TxInput = { date: new Date().toISOString().slice(0, 10), type: "Buy", asset: "", wallet: "", qty: "", price: "" };

export default function TransactionsPage() {
  const gating = usePlanGating();
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const { transactions, loading, refetch, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [modalTarget, setModalTarget] = useState<{ id?: string; initial: TxInput } | null>(null);

  if (gating.transactionsLocked) {
    return (
      <AppPage title="Transactions & swaps" subtitle="Personal audit trail">
        <LockedFeature
          title="Transaction and swap history is a paid feature"
          body="Standard keeps your positions up to date, but the full audit trail — including swaps between assets — starts on Platinum."
          bullets={["Every buy, sell, deposit and swap in one ledger", "Filter by operation type and wallet", "CSV export for your accountant"]}
        />
      </AppPage>
    );
  }

  if (loading) {
    return (
      <AppPage title="Transactions & swaps" subtitle="Personal audit trail">
        <Loading />
      </AppPage>
    );
  }

  const filtered = transactions.filter((t) => filter === "All" || t.type === filter);

  const handleSave = async (input: TxInput) => {
    if (modalTarget?.id) {
      await updateTransaction(modalTarget.id, input);
      showToast("Transaction updated.");
    } else {
      await addTransaction(input);
      showToast("Transaction added.");
    }
    setModalTarget(null);
  };

  return (
    <AppPage title="Transactions & swaps" subtitle="Personal audit trail">
      <div className="flex flex-col gap-4 max-w-[1240px]">
        <BrokerImportPanel onImported={refetch} />

        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex gap-1.5 bg-[var(--color-border-3)] p-1 rounded-[10px]">
            {filters.map((f) => {
              const on = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="h-8 px-3.5 rounded-lg border-none text-[13px] font-semibold cursor-pointer"
                  style={{ background: on ? "#fff" : "transparent", color: on ? "#111A2B" : "var(--color-text-muted)", boxShadow: on ? "0 1px 2px rgba(16,24,40,.1)" : "none" }}
                >
                  {f}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2.5">
            <Button variant="secondary" size="sm" onClick={() => showToast("CSV export queued — check your email.")}>
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setModalTarget({ initial: emptyInput })}>
              + New transaction
            </Button>
          </div>
        </div>

        <Card padding="p-0" className="overflow-hidden">
          <div
            className="grid gap-3 px-5 py-2.5 bg-[var(--color-card-alt)] border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide"
            style={{ gridTemplateColumns: "1fr 0.9fr 1.6fr 1.1fr 0.9fr 1fr 1.1fr 130px" }}
          >
            <div>Date</div>
            <div>Type</div>
            <div>Asset</div>
            <div>Wallet</div>
            <div className="text-right">Qty</div>
            <div className="text-right">Unit price</div>
            <div className="text-right">Total</div>
            <div />
          </div>
          {filtered.map((t) => {
            const [typeBg, typeFg] = typeStyle[t.type];
            const totalLabel = t.total === 0 ? "Even" : (t.total > 0 ? "+" : "−") + usd(Math.abs(t.total));
            const totalColor = t.total === 0 ? "var(--color-text-muted-2)" : posColor(t.total);
            return (
              <div
                key={t.id}
                className="grid gap-3 px-5 py-3.5 border-b border-[var(--color-border-3)] items-center hover:bg-[var(--color-card-alt)]"
                style={{ gridTemplateColumns: "1fr 0.9fr 1.6fr 1.1fr 0.9fr 1fr 1.1fr 130px" }}
              >
                <div className="font-mono text-xs text-[var(--color-text-muted-2)]">{t.date}</div>
                <div>
                  <Badge style={{ background: typeBg, color: typeFg }}>{t.type}</Badge>
                </div>
                <div className="text-[13px] font-semibold">{t.asset}</div>
                <div className="text-[13px] text-[var(--color-text-muted-2)]">{t.wallet}</div>
                <div className="text-right font-mono text-[13px]">{t.qty}</div>
                <div className="text-right font-mono text-[13px] text-[var(--color-text-muted-2)]">{t.price ? usd(t.price, t.price > 1000 ? 0 : 2) : "—"}</div>
                <div className="text-right font-mono text-[13px] font-semibold" style={{ color: totalColor }}>
                  {totalLabel}
                </div>
                <div className="flex justify-end gap-1.5">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() =>
                      setModalTarget({
                        id: t.id,
                        initial: { date: t.date, type: t.type, asset: t.asset, wallet: t.wallet, qty: t.qty === "—" ? "" : t.qty, price: String(t.price) },
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="xs"
                    onClick={() =>
                      askConfirm({
                        title: "Delete this transaction?",
                        body: "It is removed from your audit trail permanently. Wallet balances are unaffected.",
                        detail: `${t.type} · ${t.asset} · ${t.date}`,
                        cta: "Delete transaction",
                        onConfirm: () => {
                          deleteTransaction(t.id)
                            .then(() => showToast("Transaction deleted."))
                            .catch(() => showToast("Could not delete the transaction.", "err"));
                        },
                      })
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
          <div className="px-5 py-3.5 flex justify-between items-center text-xs text-[var(--color-text-muted)]">
            <span>
              {filtered.length} of {transactions.length} records
            </span>
            <span>Audit trail retained for 5 years</span>
          </div>
        </Card>
      </div>

      {modalTarget && (
        <TransactionFormModal
          title={modalTarget.id ? "Edit transaction" : "New transaction"}
          initial={modalTarget.initial}
          onSave={handleSave}
          onClose={() => setModalTarget(null)}
        />
      )}
    </AppPage>
  );
}
