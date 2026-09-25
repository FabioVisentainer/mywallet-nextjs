"use client";

import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {AppPage} from "@/modules/core/layout/AppPage";
import {Loading} from "@/modules/core/layout/Loading";
import {Button, Card} from "@fabiovisentainer/design-system";
import {useWallets} from "@/modules/wallets/WalletsContext";
import {WalletFormModal} from "@/modules/wallets/components/WalletFormModal";
import {usePlanGating} from "@/modules/plans/gating";
import {useToast} from "@/modules/core/ToastContext";
import {useConfirm} from "@/modules/core/ConfirmContext";
import {pctStr, posColor, usd} from "@/modules/core/format";

export default function WalletsPage() {
  const { wallets, loading, getAssets, walletValue, walletCost, addWallet, renameWallet, deleteWallet } = useWallets();
  const gating = usePlanGating();
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const router = useRouter();

  const [modalTarget, setModalTarget] = useState<{ mode: "new" | "rename"; id?: string; name: string } | null>(null);

  const total = wallets.reduce((s, w) => s + walletValue(w.id), 0);
  const limitReached = gating.walletLimitReached(wallets.length);

  if (loading) {
    return (
      <AppPage title="Wallets" subtitle="Create, rename and remove wallets">
        <Loading />
      </AppPage>
    );
  }

  const openNew = () => {
    if (limitReached) {
      showToast("Standard allows 2 wallets. Upgrade for unlimited.", "err");
      router.push("/plans");
      return;
    }
    setModalTarget({ mode: "new", name: "" });
  };

  const handleSave = async (name: string) => {
    if (!modalTarget) return;
    if (modalTarget.mode === "rename" && modalTarget.id) {
      await renameWallet(modalTarget.id, name);
      showToast(`Wallet "${name}" renamed.`);
      setModalTarget(null);
    } else {
      const w = await addWallet(name);
      showToast(`Wallet "${name}" created.`);
      setModalTarget(null);
      router.push(`/wallets/${w.id}`);
    }
  };

  return (
    <AppPage title="Wallets" subtitle="Create, rename and remove wallets">
      <div className="flex flex-col gap-4 max-w-[1100px]">
        <div className="flex justify-between items-center">
          <div className="text-[13px] text-[var(--color-text-muted)]">
            {wallets.length} wallets · {usd(total)} tracked
            {gating.isStandard ? ` · Standard plan: ${wallets.length} of 2 used` : ""}
          </div>
          <Button onClick={openNew} style={limitReached ? { background: "#98A2B3" } : undefined}>
            {limitReached && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            )}
            {limitReached ? "Wallet limit reached" : "+ New wallet"}
          </Button>
        </div>

        {limitReached && (
          <div className="flex items-center gap-3.5 bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] rounded-xl px-4.5 py-4">
            <div className="w-[38px] h-[38px] rounded-[11px] bg-[var(--color-warning-bg-2)] text-[var(--color-warning-fg)] grid place-items-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-[var(--color-warning-fg-2)]">You reached the Standard limit of 2 wallets</div>
              <div className="text-[13px] text-[var(--color-warning-fg)] mt-0.5">
                Platinum and Black include unlimited wallets, real-time quotes and the full history filter.
              </div>
            </div>
            <Link href="/plans" className="shrink-0 h-[38px] px-4 rounded-[9px] border-none bg-[var(--color-ink)] text-white text-[13px] font-bold flex items-center no-underline hover:no-underline hover:bg-[var(--color-ink-2)]">
              Compare plans
            </Link>
          </div>
        )}

        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {wallets.map((w) => {
            const val = walletValue(w.id);
            const cost = walletCost(w.id);
            const chg = cost ? (val / cost - 1) * 100 : 0;
            const abs = val - cost;
            return (
              <Card key={w.id} className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-[38px] h-[38px] rounded-[11px] grid place-items-center" style={{ background: w.tint, color: w.tintFg }}>
                    {w.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-bold">{w.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {getAssets(w.id).length} assets · created {w.created}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-semibold">{usd(val)}</div>
                  <div className="font-mono text-[13px] mt-0.5" style={{ color: posColor(chg) }}>
                    {pctStr(chg)} · {(abs >= 0 ? "+" : "") + usd(abs)}
                  </div>
                </div>
                <div className="flex gap-2 border-t border-[var(--color-border-3)] pt-3.5">
                  <Button href={`/wallets/${w.id}`} variant="secondary" size="sm" fullWidth>
                    Open
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setModalTarget({ mode: "rename", id: w.id, name: w.name })}>
                    Rename
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      askConfirm({
                        title: `Delete "${w.name}"?`,
                        body: "This removes the wallet and all assets inside it. Transactions stay in your history for auditing.",
                        detail: `${getAssets(w.id).length} assets · ${usd(val)}`,
                        cta: "Delete wallet",
                        onConfirm: () => {
                          deleteWallet(w.id)
                            .then(() => showToast(`Wallet "${w.name}" deleted.`))
                            .catch(() => showToast("Could not delete the wallet.", "err"));
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
          <button
            onClick={openNew}
            className="border-[1.5px] border-dashed border-[var(--color-border-2)] rounded-[14px] bg-[var(--color-card-alt)] min-h-[200px] flex flex-col items-center justify-center gap-2 cursor-pointer text-[var(--color-text-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
          >
            <div className="text-[26px] font-light">+</div>
            <div className="text-sm font-semibold">Create a wallet</div>
            <div className="text-xs">Group assets by strategy or account</div>
          </button>
        </div>
      </div>

      {modalTarget && (
        <WalletFormModal
          title={modalTarget.mode === "rename" ? "Rename wallet" : "New wallet"}
          initial={modalTarget.name}
          onSave={handleSave}
          onClose={() => setModalTarget(null)}
        />
      )}
    </AppPage>
  );
}
