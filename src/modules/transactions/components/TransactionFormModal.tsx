"use client";

import {useState} from "react";
import {Modal} from "@/modules/core/layout/Modal";
import {Button, Input, Select} from "@fabiovisentainer/design-system";
import {ApiError} from "@/services/apiClient";
import {FormSubmitTemplate} from "@/services/formSubmitTemplate";
import {useWallets} from "@/modules/wallets/WalletsContext";
import type {TxInput, TxType} from "../data";

interface Props {
  title: string;
  initial: TxInput;
  onSave: (input: TxInput) => Promise<void>;
  onClose: () => void;
}

type Errors = Partial<Record<keyof TxInput, string>>;

/** TEMPLATE METHOD — passos variáveis para o envio do formulário de transações (ver FormSubmitTemplate). */
class TransactionFormSubmit extends FormSubmitTemplate<TxInput, Errors> {
  constructor(private onSave: (input: TxInput) => Promise<void>) {
    super();
  }

  protected validate(form: TxInput): Errors | null {
    const e: Errors = {};
    if (!form.date.trim()) e.date = "Set a date.";
    if (!form.asset.trim()) e.asset = "Name the asset.";
    if (!form.wallet.trim()) e.wallet = "Pick a wallet.";
    if (form.type !== "Deposit" && !form.qty.trim()) e.qty = "Enter a quantity.";
    if (!form.price || !(parseFloat(form.price) >= 0)) e.price = form.type === "Deposit" ? "Enter the deposit amount." : "Enter a unit price.";
    return Object.keys(e).length ? e : null;
  }

  protected async save(form: TxInput) {
    await this.onSave(form);
  }

  protected mapError(err: unknown): Errors {
    return err instanceof ApiError && err.errors ? (err.errors as Errors) : {};
  }
}

export function TransactionFormModal({ title, initial, onSave, onClose }: Props) {
  const { wallets } = useWallets();
  const [form, setForm] = useState<TxInput>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const isDeposit = form.type === "Deposit";

  const setField = <K extends keyof TxInput>(key: K, value: TxInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const save = async () => {
    const result = await new TransactionFormSubmit(onSave).submit(form, setSaving);
    setErrors(result ?? {});
  };

  return (
    <Modal onClose={onClose} maxWidth={520}>
      <div className="flex flex-col gap-4">
        <div className="text-lg font-extrabold">{title}</div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" value={form.date} onChange={(e) => setField("date", e.target.value)} placeholder="2026-09-17" mono error={errors.date} />
          <Select label="Type" value={form.type} onChange={(e) => setField("type", e.target.value as TxType)}>
            <option value="Buy">Buy</option>
            <option value="Sell">Sell</option>
            <option value="Swap">Swap</option>
            <option value="Deposit">Deposit</option>
          </Select>
        </div>
        <Input label="Asset" value={form.asset} onChange={(e) => setField("asset", e.target.value)} placeholder="e.g. PETR4 · Petróleo Brasileiro" error={errors.asset} />
        {wallets.length > 0 ? (
          <Select label="Wallet" value={form.wallet} onChange={(e) => setField("wallet", e.target.value)} error={errors.wallet}>
            <option value="" disabled>
              Select a wallet…
            </option>
            {wallets.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </Select>
        ) : (
          <Input label="Wallet" value={form.wallet} onChange={(e) => setField("wallet", e.target.value)} placeholder="Wallet name" error={errors.wallet} />
        )}
        <div className="grid grid-cols-2 gap-3">
          {!isDeposit && (
            <Input label="Quantity" value={form.qty} onChange={(e) => setField("qty", e.target.value)} placeholder="100" mono error={errors.qty} />
          )}
          <div className={isDeposit ? "col-span-2" : undefined}>
            <Input
              label={isDeposit ? "Amount (USD)" : "Unit price (USD)"}
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder={isDeposit ? "5000" : "7.31"}
              mono
              error={errors.price}
            />
          </div>
        </div>
        <div className="flex gap-2.5 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save transaction"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
