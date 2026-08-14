"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppPage } from "@/modules/core/components/AppPage";
import { Loading } from "@/modules/core/components/Loading";
import { Card } from "@/modules/core/components/Card";
import { Badge } from "@/modules/core/components/Badge";
import { Alert } from "@/modules/core/components/Alert";
import { Select } from "@/modules/core/components/Select";
import { Button } from "@/modules/core/components/Button";
import { useAdmin } from "@/modules/admin/AdminContext";
import { useToast } from "@/modules/core/ToastContext";
import { useConfirm } from "@/modules/core/ConfirmContext";
import { initials } from "@/modules/core/format";
import type { BadgeTone } from "@/modules/core/components/Badge";
import type { ActivityEntry, UserPermissions, UserRole } from "@/modules/admin/types";

const roleStyle: Record<UserRole, [string, string]> = {
  Investor: ["var(--color-brand-soft)", "var(--color-brand)"],
  Analyst: ["var(--color-purple-bg)", "var(--color-purple)"],
  Administrator: ["var(--color-ink)", "#ffffff"],
};

const roleTone: Record<UserRole, BadgeTone> = {
  Investor: "brand",
  Analyst: "purple",
  Administrator: "dark",
};

const permDefs: [keyof UserPermissions, string, string][] = [
  ["view", "View market data", "Quotes, indicators and public news"],
  ["wallets", "Manage own wallets", "Create wallets, assets, goals and transactions"],
  ["publish", "Publish news", "Create, edit and delete own articles"],
  ["moderate", "Moderate all news", "Edit or unpublish articles from other analysts"],
  ["admin", "Administer users", "Change roles and remove accounts"],
];

export default function UserDetailPage({ params }: PageProps<"/admin/[id]">) {
  const { id } = use(params);
  const { loading, getUser, getActivity, getPermissions, togglePermission, changeRole, revokePublishing, deleteUser } = useAdmin();
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const router = useRouter();

  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const user = getUser(id);

  useEffect(() => {
    if (!loading && !user) router.replace("/admin");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getActivity(id).then((data) => {
      if (cancelled) return;
      setActivity(data);
      setActivityLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id, user, getActivity]);

  if (loading) {
    return (
      <AppPage title="Manage user" backHref="/admin">
        <Loading />
      </AppPage>
    );
  }
  if (!user) return null;

  const locked = user.role === "Administrator";
  const notAnalyst = user.role !== "Analyst";
  const perms = getPermissions(id);
  const [tint, tintFg] = roleStyle[user.role];

  return (
    <AppPage title="Manage user" subtitle="Roles, permissions and account removal" backHref="/admin">
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 max-w-[1080px] items-start">
        <div className="flex flex-col gap-4">
          <Card padding="p-6" className="rounded-2xl flex flex-col gap-5">
            <div className="flex items-center gap-3.5">
              <div className="w-[52px] h-[52px] rounded-full grid place-items-center text-[17px] font-bold" style={{ background: tint, color: tintFg }}>
                {initials(user.name)}
              </div>
              <div className="flex-1">
                <div className="text-lg font-extrabold">{user.name}</div>
                <div className="text-[13px] text-[var(--color-text-muted)]">
                  {user.email} · member since {user.since}
                </div>
              </div>
              <Badge tone={roleTone[user.role]}>{user.role}</Badge>
            </div>

            {locked && (
              <Alert tone="warning" title="Hierarchy restriction.">
                Administrators cannot change the role or delete another administrator. Ask the system owner to perform this action.
              </Alert>
            )}

            <Select
              label="Role"
              value={user.role}
              onChange={(e) => {
                const role = e.target.value as UserRole;
                changeRole(id, role).catch(() => showToast("Could not update the role.", "err"));
              }}
              disabled={locked}
              className="max-w-[300px]"
            >
              <option value="Investor">Investor</option>
              <option value="Analyst">Analyst</option>
              <option value="Administrator">Administrator</option>
            </Select>

            <div className="flex flex-col gap-2.5">
              <div className="text-[13px] font-semibold">Permissions</div>
              {permDefs.map(([key, label, desc]) => {
                const disabled = locked || key === "admin";
                return (
                  <label key={key} className="flex items-center gap-3 px-3.5 py-3 border border-[var(--color-border)] rounded-[11px] cursor-pointer hover:border-[#C7D3E4]">
                    <input
                      type="checkbox"
                      checked={perms[key]}
                      disabled={disabled}
                      onChange={(e) => togglePermission(id, key, e.target.checked)}
                      className="w-4 h-4 accent-[var(--color-brand)]"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: disabled ? "var(--color-text-faint)" : "var(--color-text)" }}>
                        {label}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">{desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex gap-2.5 border-t border-[var(--color-border-3)] pt-4.5">
              <Button
                disabled={locked}
                onClick={() => showToast(`Permissions updated for ${user.name}.`)}
              >
                Save changes
              </Button>
              <Button variant="secondary" onClick={() => router.push("/admin")}>
                Back to users
              </Button>
            </div>
          </Card>

          <Card padding="p-5.5" className="rounded-2xl flex flex-col gap-3.5" style={{ borderColor: "var(--color-danger-border)" }}>
            <div className="text-[15px] font-bold text-[var(--color-danger-fg-2)]">Danger zone</div>
            <div className="flex justify-between items-center gap-5">
              <div className="text-[13px] text-[var(--color-text-muted-2)]">The analyst keeps the account but can no longer publish or edit news.</div>
              <Button
                variant="danger"
                size="sm"
                disabled={notAnalyst}
                onClick={() =>
                  askConfirm({
                    title: "Revoke publishing access?",
                    body: "The account stays active but loses the right to create, edit or delete news. Published articles remain online.",
                    detail: `${user.name} · ${user.email}`,
                    cta: "Revoke access",
                    onConfirm: () => {
                      revokePublishing(id)
                        .then(() => showToast("Publishing access revoked."))
                        .catch(() => showToast("Could not revoke publishing access.", "err"));
                    },
                  })
                }
              >
                Revoke publishing
              </Button>
            </div>
            <div className="flex justify-between items-center gap-5 border-t border-[var(--color-danger-bg)] pt-3.5">
              <div className="text-[13px] text-[var(--color-text-muted-2)]">Delete this account permanently. Wallets, goals and transaction history are erased.</div>
              <Button
                variant="dangerSolid"
                size="sm"
                disabled={locked}
                onClick={() =>
                  askConfirm({
                    title: `Delete ${user.name}?`,
                    body: "This permanently erases the account, its wallets, goals and transaction history. The action cannot be undone.",
                    detail: user.email,
                    cta: "Delete account",
                    onConfirm: () => {
                      deleteUser(id)
                        .then(() => {
                          showToast("Account deleted.");
                          router.push("/admin");
                        })
                        .catch(() => showToast("Could not delete the account.", "err"));
                    },
                  })
                }
              >
                Delete account
              </Button>
            </div>
          </Card>
        </div>

        <Card padding="p-5.5" className="rounded-2xl flex flex-col gap-3.5">
          <div className="text-[15px] font-bold">Account activity</div>
          {activityLoading ? (
            <Loading />
          ) : (
            activity.map((a, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-[var(--color-border-3)]">
                <div className="w-2 h-2 rounded-full bg-[var(--color-brand)] mt-1.5 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold">{a.text}</div>
                  <div className="font-mono text-[11px] text-[var(--color-text-faint)] mt-0.5">{a.when}</div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </AppPage>
  );
}
