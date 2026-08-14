"use client";

import { useState } from "react";
import { Modal } from "@/modules/core/components/Modal";
import { Input } from "@/modules/core/components/Input";
import { Button } from "@/modules/core/components/Button";
import { ApiError } from "@/lib/apiClient";
import type { GoalInput } from "../types";

interface Props {
  title: string;
  initial: GoalInput;
  onSave: (input: GoalInput) => Promise<void>;
  onClose: () => void;
}

type Errors = Partial<Record<keyof GoalInput, string>>;

export function GoalFormModal({ title, initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<GoalInput>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof GoalInput>(key: K, value: GoalInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const save = async () => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Name the goal.";
    if (!form.target || !(parseFloat(form.target) > 0)) e.target = "Enter a target amount.";
    if (!form.due.trim()) e.due = "Set a deadline.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      if (err instanceof ApiError && err.errors) setErrors(err.errors as Errors);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="text-lg font-extrabold">{title}</div>
        <Input autoFocus label="Goal name" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Emergency fund" error={errors.name} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Target (USD)" value={form.target} onChange={(e) => setField("target", e.target.value)} placeholder="30000" mono error={errors.target} />
          <Input label="Deadline" value={form.due} onChange={(e) => setField("due", e.target.value)} placeholder="Dec 2027" error={errors.due} />
        </div>
        <div className="flex gap-2.5 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save goal"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
