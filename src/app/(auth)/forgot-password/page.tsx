"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/modules/core/ToastContext";
import { Card } from "@/modules/core/components/Card";
import { Alert } from "@/modules/core/components/Alert";
import { Input } from "@/modules/core/components/Input";
import { Button } from "@/modules/core/components/Button";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("ana.souza@mywallet.io");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const send = () => {
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address, e.g. name@domain.com.");
      return;
    }
    setSent(true);
    showToast(`Recovery link sent to ${email}.`);
  };

  return (
    <div className="flex items-center justify-center">
      <Card padding="p-6.5" className="w-full max-w-[420px] rounded-2xl flex flex-col gap-4.5">
        {sent ? (
          <div className="flex flex-col gap-4">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-success-bg)] text-[var(--color-success-fg)] grid place-items-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16v12H4z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight">Check your inbox</div>
              <div className="text-sm text-[var(--color-text-muted-2)] leading-relaxed mt-2">
                We sent a recovery link to <span className="font-bold text-[var(--color-text)]">{email}</span>. The link
                works only once and expires in 30 minutes.
              </div>
            </div>
            <Alert tone="warning">Did not receive it? Check the spam folder, or request a new link in 60 seconds.</Alert>
            <div className="flex gap-2.5">
              <Button onClick={() => router.push("/reset-password")}>Open the link</Button>
              <Button href="/" variant="secondary">
                Back to sign in
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4.5">
            <div>
              <div className="text-xl font-extrabold tracking-tight">Forgot your password?</div>
              <div className="text-sm text-[var(--color-text-muted)] leading-relaxed mt-1.5">
                Enter the email registered on your account and we will send a recovery link.
              </div>
            </div>
            <Input
              label="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="name@domain.com"
              error={error}
            />
            <div className="flex gap-2.5">
              <Button onClick={send}>Send recovery link</Button>
              <Button href="/" variant="secondary">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
