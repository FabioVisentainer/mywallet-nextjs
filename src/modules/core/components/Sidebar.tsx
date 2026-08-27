"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "../SessionContext";
import { navFor } from "../nav";

export function Sidebar() {
  const { role, accountType, user, logout } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  if (!role || !user) return null;
  const nav = navFor(role, accountType);

  return (
    <div className="w-[248px] shrink-0 bg-[var(--color-ink)] text-white flex flex-col p-4 gap-6 sticky top-0 h-screen">
      <div className="flex items-center gap-2.5 font-extrabold text-[17px] px-2">
        <div className="w-7 h-7 rounded-[9px] bg-[var(--color-brand)] grid place-items-center text-sm">M</div>
        MyWallet
      </div>

      <div className="flex flex-col gap-0.5 flex-1">
        {nav.map((n) => {
          const active = n.matchPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
          return (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] font-semibold text-sm text-left w-full hover:bg-[var(--color-ink-2)] hover:text-white transition-colors"
              style={{ background: active ? "var(--color-ink-2)" : "transparent", color: active ? "#fff" : "var(--color-ink-muted)" }}
            >
              <span className="w-[18px] text-center text-sm opacity-90">{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-[var(--color-ink-border)] pt-4 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-[10px] bg-[var(--color-brand)] grid place-items-center font-bold text-[13px]">
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">{user.name}</div>
            <div className="text-[11px] text-[var(--color-ink-muted-2)]">{user.roleLabel}</div>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="bg-transparent border border-[var(--color-ink-border)] text-[var(--color-ink-muted)] rounded-[9px] p-2 text-xs font-semibold cursor-pointer hover:text-white hover:border-[var(--color-ink-border-2)] transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
