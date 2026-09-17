"use client";

import { useState } from "react";
import { Modal } from "@/modules/core/components/Modal";
import { Input } from "@/modules/core/components/Input";
import { Select } from "@/modules/core/components/Select";
import { Button } from "@/modules/core/components/Button";
import { ApiError } from "@/lib/apiClient";
import { FormSubmitTemplate } from "@/lib/formSubmitTemplate";
import type { ManagedUserInput, UserRole } from "../types";

interface Props {
  onSave: (input: ManagedUserInput) => Promise<void>;
  onClose: () => void;
}

type Errors = Partial<Record<keyof ManagedUserInput, string>>;

const initial: ManagedUserInput = { name: "", email: "", password: "", role: "Investor" };

/** TEMPLATE METHOD — passos variáveis para o envio do formulário de novo usuário (ver FormSubmitTemplate). */
class CreateUserFormSubmit extends FormSubmitTemplate<ManagedUserInput, Errors> {
  constructor(private onSave: (input: ManagedUserInput) => Promise<void>) {
    super();
  }

  protected validate(form: ManagedUserInput): Errors | null {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Enter the user's full name.";
    if (!form.email.trim().includes("@")) e.email = "Enter a valid email.";
    if (form.password.length < 8 || !/\d/.test(form.password)) e.password = "Use at least 8 characters including one number.";
    return Object.keys(e).length ? e : null;
  }

  protected async save(form: ManagedUserInput) {
    await this.onSave(form);
  }

  protected mapError(err: unknown): Errors {
    return err instanceof ApiError && err.errors ? (err.errors as Errors) : {};
  }
}

export function CreateUserModal({ onSave, onClose }: Props) {
  const [form, setForm] = useState<ManagedUserInput>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof ManagedUserInput>(key: K, value: ManagedUserInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const save = async () => {
    const result = await new CreateUserFormSubmit(onSave).submit(form, setSaving);
    setErrors(result ?? {});
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="text-lg font-extrabold">New account</div>
        <Input autoFocus label="Full name" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Juliana Prado" error={errors.name} />
        <Input label="Email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="name@company.com" mono error={errors.email} />
        <Input
          label="Temporary password"
          type="text"
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
          placeholder="At least 8 characters, 1 number"
          mono
          error={errors.password}
          hint="Shared with the user through your own channel — MyWallet does not email it."
        />
        <Select label="Role" value={form.role} onChange={(e) => setField("role", e.target.value as UserRole)}>
          <option value="Investor">Investor</option>
          <option value="Analyst">Analyst</option>
          <option value="Administrator">Administrator</option>
        </Select>
        <div className="flex gap-2.5 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Creating…" : "Create account"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
