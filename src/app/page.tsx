"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/modules/core/SessionContext";
import { useToast } from "@/modules/core/ToastContext";
import { Alert } from "@/design-system/Alert";
import { Input } from "@/design-system/Input";
import { Button } from "@/design-system/Button";
import { ApiError } from "@/services/apiClient";
import type { Role } from "@/modules/core/types";

const roleCards = [
  { initials: "AS", name: "Ana Souza", desc: "Investor · 3 wallets", email: "ana.souza@mywallet.io" },
  { initials: "RP", name: "Rafael Prado", desc: "Analyst · publishes news", email: "rafael.prado@mywallet.io" },
  { initials: "ML", name: "Marcos Lima", desc: "Administrator · full access", email: "marcos.lima@mywallet.io" },
];

const DEMO_PASSWORD = "demo1234";

const HOME_BY_ROLE: Record<NonNullable<Role>, string> = {
  investor: "/dashboard",
  analyst: "/analyst",
  admin: "/admin",
};

export default function LoginPage() {
  const [email, setEmail] = useState("ana.souza@mywallet.io");
  const [pass, setPass] = useState("demo1234");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, logout } = useSession();
  const { showToast } = useToast();
  const router = useRouter();

  const signIn = async (loginEmail: string, loginPass: string) => {
    setSubmitting(true);
    setError("");
    try {
      const user = await login(loginEmail, loginPass);
      showToast(`Welcome back, ${user.name.split(" ")[0]}.`);
      router.push(HOME_BY_ROLE[user.role]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      <div className="hidden lg:flex bg-[var(--color-ink)] text-white p-14 flex-col justify-between">
        <div className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight">
          <div className="w-[30px] h-[30px] rounded-[9px] bg-[var(--color-brand)] grid place-items-center text-[15px]">M</div>
          MyWallet
        </div>
        <div className="flex flex-col gap-5.5 max-w-[460px]">
          <div className="text-4xl font-extrabold leading-tight tracking-tight text-pretty">
            Every asset you own, in one balance sheet.
          </div>
          <div className="text-base leading-relaxed text-[var(--color-ink-muted)]">
            Stocks and crypto side by side, multi-currency indicators, goal tracking and analyst coverage — built for
            beginners and advanced investors alike.
          </div>
          <div className="grid grid-cols-3 gap-3.5 mt-2">
            {[
              ["$122.7k", "Tracked value"],
              ["4", "Currencies"],
              ["24m", "History"],
            ].map(([v, l]) => (
              <div key={l} className="border border-[var(--color-ink-border)] rounded-xl p-3.5">
                <div className="font-mono text-xl font-semibold">{v}</div>
                <div className="text-xs text-[var(--color-ink-muted-2)] mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-[var(--color-ink-muted-4)]">© 2026 MyWallet · Market data delayed by 15 minutes</div>
      </div>

      <div className="flex items-center justify-center p-10">
        <div className="w-full max-w-[400px] flex flex-col gap-5.5">
          <div>
            <div className="text-[26px] font-extrabold tracking-tight">Sign in</div>
            <div className="text-[var(--color-text-muted)] text-sm mt-1.5">
              One entry point for investors, analysts and administrators.
            </div>
          </div>

          {error && <Alert>{error}</Alert>}

          <Input
            label="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="name@domain.com"
            invalid={!!error}
          />
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-baseline">
              <label className="text-[13px] font-semibold">Password</label>
              <Link href="/forgot-password" className="text-xs">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
              invalid={!!error}
            />
          </div>

          <Button onClick={() => signIn(email, pass)} disabled={submitting} size="lg" fullWidth>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>

          <div className="flex flex-col gap-2.5 border-t border-[var(--color-border)] pt-4.5">
            <div className="text-xs font-bold text-[var(--color-text-muted)] tracking-wide uppercase">Prototype — enter as</div>
            <div className="grid gap-2">
              {roleCards.map((r) => (
                <button
                  key={r.email}
                  onClick={() => {
                    setEmail(r.email);
                    setPass(DEMO_PASSWORD);
                    signIn(r.email, DEMO_PASSWORD);
                  }}
                  disabled={submitting}
                  className="flex items-center gap-3 text-left bg-white border border-[var(--color-border)] rounded-xl px-3.5 py-3 cursor-pointer hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft-bg)] disabled:opacity-60"
                >
                  <div className="w-[34px] h-[34px] rounded-[10px] bg-[var(--color-brand-soft)] text-[var(--color-brand)] grid place-items-center font-bold text-[13px]">
                    {r.initials}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{r.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{r.desc}</div>
                  </div>
                  <div className="text-[var(--color-text-faint)] text-lg">›</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between text-[13px] text-[var(--color-text-muted)]">
            <span>
              No account? <Link href="/signup">Create one</Link>
            </span>
            <Link href="/news" onClick={() => logout()}>
              Browse news
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
