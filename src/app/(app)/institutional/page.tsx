"use client";

import { useState } from "react";
import { AppPage } from "@/modules/core/components/AppPage";
import { Loading } from "@/modules/core/components/Loading";
import { Card } from "@/modules/core/components/Card";
import { Badge } from "@/modules/core/components/Badge";
import { Button } from "@/modules/core/components/Button";
import { Alert } from "@/modules/core/components/Alert";
import { useTeam } from "@/modules/institutional/TeamContext";
import { useInstitutionalAccess } from "@/modules/institutional/access";
import { AddMemberModal } from "@/modules/institutional/components/AddMemberModal";
import { useToast } from "@/modules/core/ToastContext";
import { useConfirm } from "@/modules/core/ConfirmContext";
import { initials } from "@/modules/core/format";
import type { BadgeTone } from "@/modules/core/components/Badge";
import type { TeamRole } from "@/modules/institutional/types";

const roleTone: Record<TeamRole, BadgeTone> = {
  Trader: "brand",
  Compliance: "warning",
  Viewer: "neutral",
};

export default function InstitutionalPage() {
  const { isInstitutional } = useInstitutionalAccess();
  const { members, loading, addMember, removeMember } = useTeam();
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const [adding, setAdding] = useState(false);

  if (!isInstitutional) {
    return (
      <AppPage title="Institutional desk" subtitle="Exclusive to institutional accounts">
        <Alert tone="warning" title="This module isn't part of your account.">
          The institutional desk — team access and consolidated reporting — is a module only some MyWallet clients have, independent of your plan. Contact support if your
          organisation needs it enabled.
        </Alert>
      </AppPage>
    );
  }

  if (loading) {
    return (
      <AppPage title="Institutional desk" subtitle="Operators with delegated access on this account">
        <Loading />
      </AppPage>
    );
  }

  return (
    <AppPage title="Institutional desk" subtitle="Operators with delegated access on this account">
      <div className="flex flex-col gap-4 max-w-[900px]">
        <Alert tone="brand">This screen is exclusive to Institutional-segment clients — it does not exist for Individual accounts, regardless of plan.</Alert>

        <div className="flex justify-between items-center">
          <div className="text-[13px] text-[var(--color-text-muted)]">{members.length} operators on this desk</div>
          <div className="flex gap-2.5">
            <Button href="/institutional/reports" variant="secondary">
              Consolidated report
            </Button>
            <Button onClick={() => setAdding(true)}>+ Add operator</Button>
          </div>
        </div>

        {members.map((m) => (
          <Card key={m.id} className="flex gap-4 items-center">
            <div className="w-[38px] h-[38px] rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)] grid place-items-center text-xs font-bold shrink-0">
              {initials(m.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{m.name}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{m.email}</div>
            </div>
            <Badge tone={roleTone[m.roleInTeam]}>{m.roleInTeam}</Badge>
            <div className="text-xs text-[var(--color-text-muted-2)] w-[90px]">Since {m.since}</div>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                askConfirm({
                  title: `Remove ${m.name}?`,
                  body: "They immediately lose delegated access to this desk's wallets and reports.",
                  detail: `${m.roleInTeam} · ${m.email}`,
                  cta: "Remove operator",
                  onConfirm: () => {
                    removeMember(m.id)
                      .then(() => showToast(`${m.name} removed from the desk.`))
                      .catch(() => showToast("Could not remove the operator.", "err"));
                  },
                })
              }
            >
              Remove
            </Button>
          </Card>
        ))}
        {members.length === 0 && <div className="py-12 text-center text-[var(--color-text-muted)] text-sm">No operators yet.</div>}
      </div>

      {adding && (
        <AddMemberModal
          onSave={async (input) => {
            await addMember(input);
            showToast("Operator added to the desk.");
            setAdding(false);
          }}
          onClose={() => setAdding(false)}
        />
      )}
    </AppPage>
  );
}
