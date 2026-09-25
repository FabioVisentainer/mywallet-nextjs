"use client";

import {useState} from "react";
import {Modal} from "@/modules/core/layout/Modal";
import {Button, Input} from "@fabiovisentainer/design-system";
import {ApiError} from "@/services/apiClient";
import {FormSubmitTemplate} from "@/services/formSubmitTemplate";

interface Props {
  title: string;
  initial?: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}

/** TEMPLATE METHOD — passos variáveis para o envio do formulário de carteira (ver FormSubmitTemplate). */
class WalletFormSubmit extends FormSubmitTemplate<string, string> {
  constructor(private onSave: (name: string) => Promise<void>) {
    super();
  }

  protected async save(name: string) {
    await this.onSave(name);
  }

  protected mapError(err: unknown): string {
    return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
  }
}

export function WalletFormModal({ title, initial = "", onSave, onClose }: Props) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const err = await new WalletFormSubmit(onSave).submit(draft.trim(), setSaving);
    setError(err ?? "");
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-lg font-extrabold">{title}</div>
          <div className="text-[13px] text-[var(--color-text-muted)] mt-1">Wallet names must be unique and at least 3 characters.</div>
        </div>
        <Input
          autoFocus
          label="Wallet name"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError("");
          }}
          placeholder="e.g. Dividend income"
          error={error}
        />
        <div className="flex gap-2.5 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save wallet"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
