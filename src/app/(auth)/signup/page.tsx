"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/modules/core/ToastContext";
import { useSession } from "@/modules/core/SessionContext";
import { apiFetch, ApiError } from "@/lib/apiClient";
import { Card } from "@/modules/core/components/Card";
import { Alert } from "@/modules/core/components/Alert";
import { Input } from "@/modules/core/components/Input";
import { Checkbox } from "@/modules/core/components/Checkbox";
import { Button } from "@/modules/core/components/Button";

interface SignupForm {
  name: string;
  email: string;
  cpf: string;
  password: string;
  confirm: string;
  terms: boolean;
}

type Errors = Partial<Record<keyof SignupForm, string>>;

function validate(s: SignupForm): Errors {
  const e: Errors = {};
  if (!s.name.trim()) e.name = "Enter your full name.";
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(s.email)) e.email = "Enter a valid email address, e.g. name@domain.com.";
  if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(s.cpf)) e.cpf = "Use the format 000.000.000-00.";
  if (s.password.length < 8 || !/\d/.test(s.password)) e.password = "Use at least 8 characters including one number.";
  if (s.confirm !== s.password || !s.confirm) e.confirm = "Passwords do not match.";
  if (!s.terms) e.terms = "You must accept the terms to continue.";
  return e;
}

export default function SignupPage() {
  const [form, setForm] = useState<SignupForm>({ name: "Ana Souza", email: "ana.souza@", cpf: "", password: "12345", confirm: "", terms: false });
  const [errors, setErrors] = useState<Errors>({
    email: "Enter a valid email address, e.g. name@domain.com.",
    password: "Use at least 8 characters including one number.",
  });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { login } = useSession();
  const router = useRouter();

  const setField = <K extends keyof SignupForm>(key: K, value: SignupForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const errCount = Object.values(errors).filter(Boolean).length;
  const passwordOk = !errors.password && form.password.length >= 8;

  const submit = async () => {
    const e = validate(form);
    if (Object.keys(e).length) {
      setErrors(e);
      showToast("Check the highlighted fields.", "err");
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      await login(form.email, form.password);
      showToast("Account created. Let us find your profile.");
      router.push("/quiz");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors as Errors);
        showToast("Check the highlighted fields.", "err");
      } else {
        showToast(err instanceof ApiError ? err.message : "Could not create your account. Please try again.", "err");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-start justify-center">
      <Card padding="p-7" className="w-full max-w-[560px] rounded-2xl flex flex-col gap-4.5">
        <div>
          <div className="text-[22px] font-extrabold tracking-tight">Create your investor account</div>
          <div className="text-[var(--color-text-muted)] text-sm mt-1">Step 1 of 3 · Account · Profile test · First wallet</div>
        </div>

        {errCount > 0 && (
          <Alert title={`${errCount} ${errCount === 1 ? "field needs attention" : "fields need attention"}`}>
            Fix the highlighted fields below to continue.
          </Alert>
        )}

        <Input label="Full name" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ana Souza" error={errors.name} />

        <div className="grid grid-cols-2 gap-3.5">
          <Input label="Email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="name@domain.com" error={errors.email} />
          <Input label="Tax ID (CPF)" value={form.cpf} onChange={(e) => setField("cpf", e.target.value)} placeholder="000.000.000-00" mono error={errors.cpf} />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            error={errors.password}
            hint={passwordOk && <div className="text-xs text-[var(--color-success-fg)]">Strong password.</div>}
          />
          <Input label="Confirm password" type="password" value={form.confirm} onChange={(e) => setField("confirm", e.target.value)} error={errors.confirm} />
        </div>

        <Checkbox
          checked={form.terms}
          onChange={(e) => setField("terms", e.target.checked)}
          error={errors.terms}
          label="I accept the terms of use and confirm that MyWallet does not provide personalised investment advice."
        />

        <div className="flex gap-3 items-center pt-1">
          <Button onClick={submit} disabled={submitting} size="lg">
            {submitting ? "Creating account…" : "Create account"}
          </Button>
          <Button href="/" variant="secondary" size="lg">
            Back to sign in
          </Button>
        </div>
      </Card>
    </div>
  );
}
