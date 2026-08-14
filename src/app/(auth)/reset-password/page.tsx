"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/modules/core/ToastContext";
import { Card } from "@/modules/core/components/Card";
import { Alert } from "@/modules/core/components/Alert";
import { Input } from "@/modules/core/components/Input";
import { Button } from "@/modules/core/components/Button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const { showToast } = useToast();
  const router = useRouter();

  const rules = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Both fields match", ok: !!password && password === confirm },
  ];

  const submit = () => {
    const e: typeof errors = {};
    if (password.length < 8 || !/\d/.test(password)) e.password = "Use at least 8 characters including one number.";
    if (!confirm || confirm !== password) e.confirm = "Passwords do not match.";
    if (Object.keys(e).length) {
      setErrors(e);
      showToast("Check the highlighted fields.", "err");
      return;
    }
    showToast("Password updated. Sign in with your new password.");
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center">
      <Card padding="p-6.5" className="w-full max-w-[440px] rounded-2xl flex flex-col gap-4.5">
        <div>
          <div className="text-xl font-extrabold tracking-tight">Set a new password</div>
          <div className="text-sm text-[var(--color-text-muted)] leading-relaxed mt-1.5">
            Resetting the password for <span className="font-bold text-[var(--color-text)]">ana.souza@mywallet.io</span>.
          </div>
        </div>

        <Alert tone="warning">
          This link expires in <span className="font-mono font-semibold">29:41</span>. After that you will need to request a new one.
        </Alert>

        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((er) => ({ ...er, password: undefined }));
          }}
          placeholder="At least 8 characters"
          error={errors.password}
        />

        <Input
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setErrors((er) => ({ ...er, confirm: undefined }));
          }}
          error={errors.confirm}
        />

        <div className="flex flex-col gap-1.5 bg-[var(--color-card-alt)] border border-[var(--color-border)] rounded-[11px] p-3.5">
          {rules.map((r) => (
            <div key={r.label} className="flex items-center gap-2.5 text-xs" style={{ color: r.ok ? "var(--color-success-fg)" : "var(--color-text-muted)" }}>
              <span
                className="w-[15px] h-[15px] rounded-full text-white grid place-items-center text-[9px] font-bold"
                style={{ background: r.ok ? "var(--color-success)" : "#D0D5DD" }}
              >
                {r.ok ? "✓" : "·"}
              </span>
              {r.label}
            </div>
          ))}
        </div>

        <div className="flex gap-2.5">
          <Button onClick={submit}>Save new password</Button>
          <Button href="/" variant="secondary">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
