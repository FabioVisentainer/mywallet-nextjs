import type {ReactNode} from "react";
import {Sidebar} from "@/modules/core/layout/Sidebar";
import {Toast} from "@/modules/core/layout/Toast";
import {ConfirmModal} from "@/modules/core/layout/ConfirmModal";
import {RequireSession} from "@/modules/core/layout/RequireSession";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <RequireSession>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">{children}</div>
      </div>
      <Toast />
      <ConfirmModal />
    </RequireSession>
  );
}
