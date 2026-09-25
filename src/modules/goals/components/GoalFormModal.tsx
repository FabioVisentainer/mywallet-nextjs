"use client";

import {useState} from "react";
import {Modal} from "@/modules/core/layout/Modal";
import {Button, Input} from "@fabiovisentainer/design-system";
import {ApiError} from "@/services/apiClient";
import {FormSubmitTemplate} from "@/services/formSubmitTemplate";
import type {GoalInput} from "../types";

interface Props {
  title: string;
  initial: GoalInput;
  onSave: (input: GoalInput) => Promise<void>;
  onClose: () => void;
}

type Errors = Partial<Record<keyof GoalInput, string>>;

/** TEMPLATE METHOD — passos variáveis para o envio do formulário de metas (ver FormSubmitTemplate). */
class GoalFormSubmit extends FormSubmitTemplate<GoalInput, Errors> {
  constructor(private onSave: (input: GoalInput) => Promise<void>) {
    super();
  }

  protected validate(form: GoalInput): Errors | null {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Name the goal.";
    if (!form.target || !(parseFloat(form.target) > 0)) e.target = "Enter a target amount.";
    if (!form.due.trim()) e.due = "Set a deadline.";
    return Object.keys(e).length ? e : null;
  }

  protected async save(form: GoalInput) {
    await this.onSave(form);
  }

  protected mapError(err: unknown): Errors {
    return err instanceof ApiError && err.errors ? (err.errors as Errors) : {};
  }
}

export function GoalFormModal({ title, initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<GoalInput>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof GoalInput>(key: K, value: GoalInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const save = async () => {
    const result = await new GoalFormSubmit(onSave).submit(form, setSaving);
    setErrors(result ?? {});
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
