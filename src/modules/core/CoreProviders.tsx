"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "./SessionContext";
import { ToastProvider } from "./ToastContext";
import { ConfirmProvider } from "./ConfirmContext";

/** Foundation providers every module may depend on: session/role/plan, toast, confirm dialog. */
export function CoreProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
