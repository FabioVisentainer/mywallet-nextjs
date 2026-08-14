"use client";

import { useState } from "react";
import { Modal } from "@/modules/core/components/Modal";
import { Input } from "@/modules/core/components/Input";
import { Button } from "@/modules/core/components/Button";
import { ApiError } from "@/lib/apiClient";

interface Props {
  title: string;
  initial?: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}

export function WalletFormModal({ title, initial = "", onSave, onClose }: Props) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave(draft.trim());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
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
