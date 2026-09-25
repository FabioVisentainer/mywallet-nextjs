"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useSession} from "../SessionContext";
import {useCurrencyRates} from "@/modules/plans/useCurrencyRates";

interface Props {
  title: string;
  subtitle?: string;
  backHref?: string;
}

export function Topbar({ title, subtitle, backHref }: Props) {
  const { role } = useSession();
  const router = useRouter();
  const { rates } = useCurrencyRates();

  return (
    <div className="h-[68px] bg-[var(--color-card)] border-b border-[var(--color-border)] flex items-center justify-between px-7 gap-5 sticky top-0 z-20">
      <div className="flex items-center gap-3.5 min-w-0">
        {backHref && (
          <button
            onClick={() => router.push(backHref)}
            className="w-8 h-8 rounded-[9px] border border-[var(--color-border)] bg-white cursor-pointer text-[var(--color-text-muted-2)]"
          >
            ‹
          </button>
        )}
        <div className="min-w-0">
          <div className="text-lg font-extrabold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{title}</div>
          {subtitle && <div className="text-xs text-[var(--color-text-muted)]">{subtitle}</div>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-1.5">
          {rates.map((r) => (
            <div key={r.code} className="border border-[var(--color-border)] rounded-lg px-2.5 py-1 flex gap-1.5 items-baseline">
              <span className="text-[11px] font-bold text-[var(--color-text-muted)]">{r.code}</span>
              <span className="font-mono text-xs font-medium">{r.rate.toFixed(2)}</span>
            </div>
          ))}
        </div>
        {!role && (
          <Link
            href="/"
            className="h-[38px] px-4 rounded-[9px] border-none bg-[var(--color-brand)] text-white font-bold flex items-center no-underline hover:no-underline"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
