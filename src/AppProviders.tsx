"use client";

import type { ReactNode } from "react";
import { CoreProviders } from "@/modules/core/CoreProviders";
import { WalletsProvider } from "@/modules/wallets/WalletsContext";
import { GoalsProvider } from "@/modules/goals/GoalsContext";
import { NewsProvider } from "@/modules/news/NewsContext";
import { AdminProvider } from "@/modules/admin/AdminContext";
import { TeamProvider } from "@/modules/institutional/TeamContext";
import { PromotionsProvider } from "@/modules/promotions/PromotionsContext";

/**
 * Wires every feature module's state provider together for the whole app.
 * This file is intentionally the only place that knows about all modules —
 * a client who only licenses e.g. the wallets module can drop this file
 * and compose just <CoreProviders><WalletsProvider>...</WalletsProvider></CoreProviders>.
 * TeamProvider stays wired in for every session (not just Institutional accounts) the same
 * way AdminProvider is — the institutional/ pages gate on useInstitutionalAccess(), not on
 * whether the provider is mounted.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CoreProviders>
      <WalletsProvider>
        <GoalsProvider>
          <NewsProvider>
            <AdminProvider>
              <TeamProvider>
                <PromotionsProvider>{children}</PromotionsProvider>
              </TeamProvider>
            </AdminProvider>
          </NewsProvider>
        </GoalsProvider>
      </WalletsProvider>
    </CoreProviders>
  );
}
