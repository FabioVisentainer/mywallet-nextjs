"use client";

import { useState } from "react";
import { Modal } from "@/modules/core/layout/Modal";
import { Input } from "@/design-system/Input";
import { Select } from "@/design-system/Select";
import { Textarea } from "@/design-system/Textarea";
import { Button } from "@/design-system/Button";
import { ApiError } from "@/services/apiClient";
import { FormSubmitTemplate } from "@/services/formSubmitTemplate";
import type { PromotionInput } from "../types";
import type { PlanName } from "@/modules/core/types";

interface Props {
  title: string;
  initial: PromotionInput;
  onSave: (input: PromotionInput) => Promise<void>;
  onClose: () => void;
}

type Errors = Partial<Record<keyof PromotionInput, string>>;

/** TEMPLATE METHOD — passos variáveis para o envio do formulário de promoções (ver FormSubmitTemplate). */
class PromotionFormSubmit extends FormSubmitTemplate<PromotionInput, Errors> {
  constructor(private onSave: (input: PromotionInput) => Promise<void>) {
    super();
  }

  protected validate(form: PromotionInput): Errors | null {
    const e: Errors = {};
    if (!form.title.trim()) e.title = "Give the promotion a title.";
    if (!form.description.trim()) e.description = "Describe the promotion.";
    const pct = parseFloat(form.discountPct);
    if (!form.discountPct || !(pct > 0 && pct <= 100)) e.discountPct = "Enter a discount between 1 and 100%.";
    if (!form.startsAt.trim()) e.startsAt = "Set a start date.";
    if (!form.endsAt.trim()) e.endsAt = "Set an end date.";
    if (form.startsAt && form.endsAt && form.endsAt < form.startsAt) e.endsAt = "The end date must be on or after the start date.";
    return Object.keys(e).length ? e : null;
  }

  protected async save(form: PromotionInput) {
    await this.onSave(form);
  }

  protected mapError(err: unknown): Errors {
    return err instanceof ApiError && err.errors ? (err.errors as Errors) : {};
  }
}

export function PromotionFormModal({ title, initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<PromotionInput>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof PromotionInput>(key: K, value: PromotionInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const save = async () => {
    const result = await new PromotionFormSubmit(onSave).submit(form, setSaving);
    setErrors(result ?? {});
  };

  return (
    <Modal onClose={onClose} maxWidth={520}>
      <div className="flex flex-col gap-4">
        <div className="text-lg font-extrabold">{title}</div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Plan" value={form.planName} onChange={(e) => setField("planName", e.target.value as PlanName)}>
            <option value="Standard">Standard</option>
            <option value="Platinum">Platinum</option>
            <option value="Black">Black</option>
          </Select>
          <Input
            label="Discount (%)"
            value={form.discountPct}
            onChange={(e) => setField("discountPct", e.target.value)}
            placeholder="20"
            mono
            error={errors.discountPct}
          />
        </div>
        <Input autoFocus label="Title" value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="e.g. Black Friday" error={errors.title} />
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="What this promotion offers and who it's for"
          error={errors.description}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Starts on" value={form.startsAt} onChange={(e) => setField("startsAt", e.target.value)} placeholder="2026-11-20" mono error={errors.startsAt} />
          <Input label="Ends on" value={form.endsAt} onChange={(e) => setField("endsAt", e.target.value)} placeholder="2026-11-30" mono error={errors.endsAt} />
        </div>
        <div className="flex gap-2.5 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save promotion"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
