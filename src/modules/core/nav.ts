import type { AccountType, Role } from "./types";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  matchPrefixes: string[];
}

const navDefs: Record<NonNullable<Role>, NavItem[]> = {
  investor: [
    { href: "/dashboard", label: "Overview", icon: "◧", matchPrefixes: ["/dashboard"] },
    { href: "/wallets", label: "Wallets", icon: "▤", matchPrefixes: ["/wallets"] },
    { href: "/performance", label: "Performance", icon: "◪", matchPrefixes: ["/performance"] },
    { href: "/goals", label: "Goals", icon: "◎", matchPrefixes: ["/goals"] },
    { href: "/transactions", label: "Transactions", icon: "⇄", matchPrefixes: ["/transactions"] },
    { href: "/news", label: "News", icon: "❏", matchPrefixes: ["/news"] },
    { href: "/plans", label: "Plans", icon: "✦", matchPrefixes: ["/plans"] },
  ],
  analyst: [
    { href: "/analyst", label: "Analyst studio", icon: "✎", matchPrefixes: ["/analyst"] },
    { href: "/news", label: "News portal", icon: "❏", matchPrefixes: ["/news"] },
    { href: "/performance", label: "Market chart", icon: "◪", matchPrefixes: ["/performance"] },
  ],
  admin: [
    { href: "/admin", label: "Users", icon: "☰", matchPrefixes: ["/admin"] },
    { href: "/news", label: "News portal", icon: "❏", matchPrefixes: ["/news"] },
    { href: "/performance", label: "Market chart", icon: "◪", matchPrefixes: ["/performance"] },
  ],
};

// Appended to a role's nav only for clients on the Institutional segment — orthogonal to role and to plan.
const institutionalItem: NavItem = { href: "/institutional", label: "Institutional desk", icon: "◆", matchPrefixes: ["/institutional"] };

export function navFor(role: Role, accountType?: AccountType | null): NavItem[] {
  if (!role) return [];
  const base = navDefs[role];
  return accountType === "Institutional" ? [...base, institutionalItem] : base;
}
