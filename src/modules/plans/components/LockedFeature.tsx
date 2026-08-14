"use client";

import { Card } from "@/modules/core/components/Card";
import { Button } from "@/modules/core/components/Button";

interface Props {
  title: string;
  body: string;
  bullets: string[];
}

export function LockedFeature({ title, body, bullets }: Props) {
  return (
    <Card padding="px-10 py-11" className="max-w-[640px] rounded-2xl flex flex-col items-center text-center gap-3.5">
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-soft)] text-[var(--color-brand)] grid place-items-center">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      </div>
      <div className="text-xl font-extrabold tracking-tight">{title}</div>
      <div className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-[420px]">{body}</div>
      <div className="flex flex-col gap-2 w-full max-w-[360px] mt-1.5 text-left">
        {bullets.map((b) => (
          <div key={b} className="flex items-center gap-2.5 text-[13px] text-[var(--color-text-muted-3)]">
            <span className="w-[18px] h-[18px] rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-fg)] grid place-items-center text-[10px] font-bold">
              ✓
            </span>
            {b}
          </div>
        ))}
      </div>
      <div className="flex gap-2.5 mt-2.5">
        <Button href="/plans">Upgrade to Platinum</Button>
        <Button href="/plans" variant="secondary">
          Compare plans
        </Button>
      </div>
      <div className="text-xs text-[var(--color-text-faint)]">You are on the Standard plan · free forever</div>
    </Card>
  );
}
