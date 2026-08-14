"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppPage } from "@/modules/core/components/AppPage";
import { StatCard } from "@/modules/core/components/StatCard";
import { Loading } from "@/modules/core/components/Loading";
import { Card } from "@/modules/core/components/Card";
import { Button } from "@/modules/core/components/Button";
import { useWallets } from "@/modules/wallets/WalletsContext";
import { WalletFormModal } from "@/modules/wallets/components/WalletFormModal";
import { useToast } from "@/modules/core/ToastContext";
import { useConfirm } from "@/modules/core/ConfirmContext";
import { usd, num, pctStr, posColor } from "@/modules/core/format";

export default function WalletDetailPage({ params }: PageProps<"/wallets/[id]">) {
  const { id } = use(params);
  const { loading, getWallet, getAssets, walletValue, walletCost, renameWallet, deleteAsset } = useWallets();
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);

  const wallet = getWallet(id);

  useEffect(() => {
    if (!loading && !wallet) router.replace("/wallets");
  }, [loading, wallet, router]);

  if (loading) {
    return (
      <AppPage title="Wallet" backHref="/wallets">
        <Loading />
      </AppPage>
    );
  }
  if (!wallet) return null;

  const assets = getAssets(id);
  const wVal = walletValue(id);
  const wCost = walletCost(id);
  const result = wVal - wCost;

  return (
    <AppPage title={wallet.name} subtitle="Assets linked to this wallet" backHref="/wallets">
      <div className="flex flex-col gap-4 max-w-[1240px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <StatCard label="Market value" value={usd(wVal)} />
          <StatCard label="Invested cost" value={usd(wCost)} />
          <StatCard label="Result" value={(result >= 0 ? "+" : "−") + usd(Math.abs(result))} color={posColor(result)} />
          <StatCard label="Return" value={pctStr(wCost ? (wVal / wCost - 1) * 100 : 0)} color={posColor(result)} />
        </div>

        <Card padding="p-0" className="overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4.5 border-b border-[var(--color-border)]">
            <div className="text-[15px] font-bold">Assets</div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setRenaming(true)}>
                Rename wallet
              </Button>
              <Button href={`/wallets/${id}/assets/new`} size="sm">
                + Add asset
              </Button>
            </div>
          </div>

          {assets.length > 0 ? (
            <div>
              <div
                className="grid gap-3 px-5 py-2.5 bg-[var(--color-card-alt)] border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide"
                style={{ gridTemplateColumns: "2fr 0.9fr 1fr 1fr 1.1fr 0.9fr 128px" }}
              >
                <div>Asset</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Avg price</div>
                <div className="text-right">Market</div>
                <div className="text-right">Position</div>
                <div className="text-right">Change</div>
                <div />
              </div>
              {assets.map((a) => {
                const pos = a.qty * a.price;
                const chg = (a.price / a.avg - 1) * 100;
                const badge = a.type === "Crypto" ? "CRY" : a.type === "ETF" ? "ETF" : a.type === "REIT" ? "RET" : "STK";
                return (
                  <div
                    key={a.id}
                    className="grid gap-3 px-5 py-3.5 border-b border-[var(--color-border-3)] items-center hover:bg-[var(--color-card-alt)]"
                    style={{ gridTemplateColumns: "2fr 0.9fr 1fr 1fr 1.1fr 0.9fr 128px" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-[34px] h-[34px] rounded-[9px] grid place-items-center text-[11px] font-bold"
                        style={{
                          background: a.type === "Crypto" ? "var(--color-purple-bg)" : "var(--color-brand-soft)",
                          color: a.type === "Crypto" ? "var(--color-purple)" : "var(--color-brand)",
                        }}
                      >
                        {badge}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{a.ticker}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{a.name}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[13px]">{num(a.qty, a.qty % 1 ? 4 : 0)}</div>
                    <div className="text-right font-mono text-[13px] text-[var(--color-text-muted-2)]">{usd(a.avg, a.avg > 1000 ? 0 : 2)}</div>
                    <div className="text-right font-mono text-[13px]">{usd(a.price, a.price > 1000 ? 0 : 2)}</div>
                    <div className="text-right font-mono text-[13px] font-semibold">{usd(pos)}</div>
                    <div className="text-right font-mono text-[13px] font-semibold" style={{ color: posColor(chg) }}>
                      {pctStr(chg)}
                    </div>
                    <div className="flex gap-1.5 justify-end">
                      <Button href={`/wallets/${id}/assets/${a.id}`} variant="secondary" size="xs">
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() =>
                          askConfirm({
                            title: `Remove ${a.ticker} from this wallet?`,
                            body: "The position stops counting towards your balance. Past transactions remain in the audit trail.",
                            detail: `${a.ticker} · ${num(a.qty, a.qty % 1 ? 4 : 0)} units · ${usd(pos)}`,
                            cta: "Remove asset",
                            onConfirm: () => {
                              deleteAsset(id, a.id)
                                .then(() => showToast(`${a.ticker} removed from ${wallet.name}.`))
                                .catch(() => showToast("Could not remove the asset.", "err"));
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
            </div>
          ) : (
            <div className="py-15 text-center flex flex-col items-center gap-2.5">
              <div className="w-[46px] h-[46px] rounded-xl bg-[var(--color-border-3)] grid place-items-center text-[var(--color-text-faint)] text-xl">
                ◦
              </div>
              <div className="text-[15px] font-bold">No assets in this wallet yet</div>
              <div className="text-[13px] text-[var(--color-text-muted)] max-w-[340px]">
                Add your first stock or crypto position to start tracking performance.
              </div>
              <Button href={`/wallets/${id}/assets/new`} size="sm" className="mt-1.5">
                + Add asset
              </Button>
            </div>
          )}
        </Card>
      </div>

      {renaming && (
        <WalletFormModal
          title="Rename wallet"
          initial={wallet.name}
          onSave={async (name) => {
            await renameWallet(id, name);
            showToast(`Wallet renamed to "${name}".`);
            setRenaming(false);
          }}
          onClose={() => setRenaming(false)}
        />
      )}
    </AppPage>
  );
}
