"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/apiClient";
import { useWallets } from "@/modules/wallets/WalletsContext";
import { useToast } from "@/modules/core/ToastContext";
import { Card } from "@/modules/core/components/Card";
import { Select } from "@/modules/core/components/Select";
import { Button } from "@/modules/core/components/Button";

interface BrokerSwap {
  id: string;
  exchange: string;
  fromTicker: string;
  toTicker: string;
  fromQty: number;
  toQty: number;
  executedAt: string;
}

/**
 * Req. 16 — histórico de swaps de criptomoedas realizados em corretoras
 * externas. Lista o feed simulado da corretora (AIE, mocks/external/brokerFeed.ts)
 * e permite importar cada swap para o próprio livro-razão de transações (ALI, Transaction).
 */
export function BrokerImportPanel({ onImported }: { onImported: () => void }) {
  const [swaps, setSwaps] = useState<BrokerSwap[] | null>(null);
  const [walletName, setWalletName] = useState("");
  const [importing, setImporting] = useState<string | null>(null);
  const { wallets } = useWallets();
  const { showToast } = useToast();

  const load = () => {
    apiFetch<{ swaps: BrokerSwap[] }>("/api/market/broker-feed").then((data) => setSwaps(data.swaps));
  };

  useEffect(load, []);

  const effectiveWalletName = walletName || wallets[0]?.name || "";

  const importSwap = async (swapId: string) => {
    if (!effectiveWalletName) {
      showToast("Create a wallet first.", "err");
      return;
    }
    setImporting(swapId);
    try {
      await apiFetch("/api/transactions/import", { method: "POST", body: JSON.stringify({ swapId, walletName: effectiveWalletName }) });
      showToast("Swap imported into your transaction history.");
      load();
      onImported();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Could not import this swap.", "err");
    } finally {
      setImporting(null);
    }
  };

  if (swaps !== null && swaps.length === 0) return null;

  return (
    <Card padding="p-5" className="flex flex-col gap-3.5">
      <div className="flex justify-between items-center flex-wrap gap-2.5">
        <div>
          <div className="text-[15px] font-bold">Swaps pending import from your exchanges</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Reported by external brokers — not yet part of your audit trail.</div>
        </div>
        {wallets.length > 0 && (
          <Select label="" value={effectiveWalletName} onChange={(e) => setWalletName(e.target.value)} className="!w-[200px]">
            {wallets.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </Select>
        )}
      </div>
      {swaps === null ? (
        <div className="text-sm text-[var(--color-text-muted)]">Loading exchange feed…</div>
      ) : (
        <div className="flex flex-col gap-2">
          {swaps.map((s) => (
            <div key={s.id} className="flex justify-between items-center gap-3 px-3.5 py-3 rounded-xl border border-[var(--color-border)]">
              <div className="text-sm">
                <span className="font-semibold">{s.exchange}</span>
                <span className="text-[var(--color-text-muted-2)]"> · {s.fromQty} {s.fromTicker} → {s.toQty} {s.toTicker}</span>
                <span className="text-[var(--color-text-muted)] font-mono text-xs"> · {s.executedAt}</span>
              </div>
              <Button size="xs" onClick={() => importSwap(s.id)} disabled={importing === s.id}>
                {importing === s.id ? "Importing…" : "Import"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
