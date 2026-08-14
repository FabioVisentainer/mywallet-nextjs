"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallets } from "../WalletsContext";
import { useToast } from "@/modules/core/ToastContext";
import { usd } from "@/modules/core/format";
import { ApiError } from "@/lib/apiClient";
import { Card } from "@/modules/core/components/Card";
import { Alert } from "@/modules/core/components/Alert";
import { Input } from "@/modules/core/components/Input";
import { Select } from "@/modules/core/components/Select";
import { Button } from "@/modules/core/components/Button";
import type { AssetInput, AssetType } from "../types";

interface Props {
  walletId: string;
  walletName: string;
  mode: "new" | "edit";
  assetId?: string;
  initial: AssetInput;
}

type Errors = Partial<Record<"ticker" | "name" | "qty" | "avg", string>>;

export function AssetForm({ walletId, walletName, mode, assetId, initial }: Props) {
  const [form, setForm] = useState<AssetInput>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const { addAsset, updateAsset } = useWallets();
  const { showToast } = useToast();
  const router = useRouter();

  const setField = <K extends keyof AssetInput>(key: K, value: AssetInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const previewVal = (parseFloat(form.qty) || 0) * (parseFloat(form.avg) || 0);
  const hasErrors = Object.values(errors).some(Boolean);

  const save = async () => {
    const e: Errors = {};
    if (!form.ticker.trim()) e.ticker = "Ticker is required.";
    if (!form.name.trim()) e.name = "Asset name is required.";
    if (!form.qty || !(parseFloat(form.qty) > 0)) e.qty = "Enter a quantity greater than zero.";
    if (!form.avg || !(parseFloat(form.avg) > 0)) e.avg = "Enter a valid average price.";
    if (Object.keys(e).length) {
      setErrors(e);
      showToast("Some required fields are missing.", "err");
      return;
    }
    setSaving(true);
    try {
      if (mode === "edit" && assetId) {
        await updateAsset(walletId, assetId, form);
        showToast(`${form.ticker.toUpperCase()} updated.`);
      } else {
        await addAsset(walletId, form);
        showToast(`${form.ticker.toUpperCase()} added to ${walletName}.`);
      }
      router.push(`/wallets/${walletId}`);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors as Errors);
        showToast("Some required fields are missing.", "err");
      } else {
        showToast("Could not save this asset. Please try again.", "err");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[720px] flex flex-col gap-4">
      {hasErrors && <Alert title="Required fields are missing.">Complete the highlighted fields to save this asset.</Alert>}

      <Card padding="p-6" className="rounded-2xl flex flex-col gap-4.5">
        <div className="grid grid-cols-2 gap-3.5">
          <Input
            label="Ticker"
            required
            value={form.ticker}
            onChange={(e) => setField("ticker", e.target.value)}
            placeholder="PETR4, BTC…"
            className="uppercase"
            mono
            error={errors.ticker}
          />
          <Select label="Asset class" value={form.type} onChange={(e) => setField("type", e.target.value as AssetType)}>
            <option value="Stock">Stock</option>
            <option value="Crypto">Crypto</option>
            <option value="ETF">ETF</option>
            <option value="REIT">REIT</option>
          </Select>
        </div>

        <Input label="Asset name" required value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Petróleo Brasileiro PN" error={errors.name} />

        <div className="grid grid-cols-3 gap-3.5">
          <Input label="Quantity" required value={form.qty} onChange={(e) => setField("qty", e.target.value)} placeholder="0.00" mono error={errors.qty} />
          <Input
            label="Average price (USD)"
            required
            value={form.avg}
            onChange={(e) => setField("avg", e.target.value)}
            placeholder="0.00"
            mono
            error={errors.avg}
          />
          <Input label="Purchase date" value={form.date} onChange={(e) => setField("date", e.target.value)} placeholder="2026-08-11" mono />
        </div>

        <div className="bg-[var(--color-brand-soft-bg)] border border-[var(--color-brand-soft-border)] rounded-[11px] p-3.5 flex justify-between items-center">
          <div className="text-[13px] text-[var(--color-text-muted-3)]">Estimated position value</div>
          <div className="font-mono text-lg font-semibold text-[var(--color-brand-hover)]">{usd(previewVal)}</div>
        </div>

        <div className="flex gap-2.5 border-t border-[var(--color-border-3)] pt-4.5">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Add to wallet"}
          </Button>
          <Button variant="secondary" onClick={() => router.push(`/wallets/${walletId}`)}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
