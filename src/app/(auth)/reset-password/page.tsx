"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/modules/core/ToastContext";
import { apiFetch, ApiError } from "@/services/apiClient";
import { Card } from "@/design-system/Card";
import { Alert } from "@/design-system/Alert";
import { Input } from "@/design-system/Input";
import { Button } from "@/design-system/Button";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; general?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  const token = useSearchParams().get("token") || "";

  const rules = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Both fields match", ok: !!password && password === confirm },
  ];

  const submit = async () => {
    const e: typeof errors = {};
    if (password.length < 8 || !/\d/.test(password)) e.password = "Use at least 8 characters including one number.";
    if (!confirm || confirm !== password) e.confirm = "Passwords do not match.";
    if (!token) e.general = "This recovery link is invalid. Request a new one.";
    if (Object.keys(e).length) {
      setErrors(e);
      showToast("Check the highlighted fields.", "err");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
      showToast("Password updated. Sign in with your new password.");
      router.push("/");
    } catch (err) {
      setErrors({ general: err instanceof ApiError ? err.message : "Could not reset your password. Please try again." });
      showToast("Could not reset your password.", "err");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card padding="p-6.5" className="w-full max-w-[440px] rounded-2xl flex flex-col gap-4.5">
      <div>
        <div className="text-xl font-extrabold tracking-tight">Set a new password</div>
        <div className="text-sm text-[var(--color-text-muted)] leading-relaxed mt-1.5">Resetting your password using the link sent to your e-mail.</div>
      </div>

      {errors.general ? (
        <Alert tone="danger">{errors.general}</Alert>
      ) : (
        <Alert tone="warning">This link expires 30 minutes after it was requested. After that you will need to request a new one.</Alert>
      )}

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
        <Button onClick={submit} disabled={submitting}>
          {submitting ? "Saving…" : "Save new password"}
        </Button>
        <Button href="/" variant="secondary">
          Cancel
        </Button>
      </div>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
