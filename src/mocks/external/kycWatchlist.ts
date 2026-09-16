// Simulates a third-party AML/KYC screening service (Req. 3 / LGPD & fraud
// prevention non-functional requirement: checking new investors against a
// sanctions/watchlist before activating the account). The list is owned and
// maintained by the external screening vendor, never by this application.
// Swap this module for a real call to a KYC provider without touching callers.

export interface KycCheckResult {
  name: string;
  matched: boolean;
  listName?: string;
}

const watchlist = ["Jane Sanctioned", "John Blocklisted"];

/** Screens a full name against the external watchlist. */
export function screenName(name: string): KycCheckResult {
  const normalized = name.trim().toLowerCase();
  const hit = watchlist.find((w) => w.toLowerCase() === normalized);
  return { name, matched: !!hit, listName: hit ? "Mock Global Watchlist" : undefined };
}
