"use client";

import { useState } from "react";
import { Modal } from "@/modules/core/components/Modal";
import { Input } from "@/modules/core/components/Input";
import { Select } from "@/modules/core/components/Select";
import { Button } from "@/modules/core/components/Button";
import { ApiError } from "@/lib/apiClient";
import type { TeamMemberInput, TeamRole } from "../types";

interface Props {
  onSave: (input: TeamMemberInput) => Promise<void>;
  onClose: () => void;
}

type Errors = Partial<Record<keyof TeamMemberInput, string>>;

const initial: TeamMemberInput = { name: "", email: "", roleInTeam: "Trader" };

export function AddMemberModal({ onSave, onClose }: Props) {
  const [form, setForm] = useState<TeamMemberInput>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof TeamMemberInput>(key: K, value: TeamMemberInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const save = async () => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Name the operator.";
    if (!form.email.trim().includes("@")) e.email = "Enter a valid email.";
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
        <div className="text-lg font-extrabold">Add operator to the desk</div>
        <Input autoFocus label="Name" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Bruno Alencar" error={errors.name} />
        <Input label="Email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="name@company.com" mono error={errors.email} />
        <Select label="Role on the desk" value={form.roleInTeam} onChange={(e) => setField("roleInTeam", e.target.value as TeamRole)}>
          <option value="Trader">Trader</option>
          <option value="Compliance">Compliance</option>
          <option value="Viewer">Viewer</option>
        </Select>
        <div className="flex gap-2.5 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Add operator"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
