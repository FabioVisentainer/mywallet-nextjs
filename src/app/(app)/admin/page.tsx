"use client";

import { useState } from "react";
import { AppPage } from "@/modules/core/components/AppPage";
import { Loading } from "@/modules/core/components/Loading";
import { Card } from "@/modules/core/components/Card";
import { Badge } from "@/modules/core/components/Badge";
import { Button } from "@/modules/core/components/Button";
import { useAdmin } from "@/modules/admin/AdminContext";
import { CreateUserModal } from "@/modules/admin/components/CreateUserModal";
import { useToast } from "@/modules/core/ToastContext";
import { initials } from "@/modules/core/format";
import type { BadgeTone } from "@/modules/core/components/Badge";
import type { UserRole } from "@/modules/admin/types";

const roleFilters: (UserRole | "All")[] = ["All", "Investor", "Analyst", "Administrator"];

const roleTone: Record<UserRole, BadgeTone> = {
  Investor: "brand",
  Analyst: "purple",
  Administrator: "dark",
};

const roleAvatarStyle: Record<UserRole, { background: string; color: string }> = {
  Investor: { background: "var(--color-brand-soft)", color: "var(--color-brand)" },
  Analyst: { background: "var(--color-purple-bg)", color: "var(--color-purple)" },
  Administrator: { background: "var(--color-ink)", color: "#ffffff" },
};

const statusColor: Record<string, string> = {
  Active: "var(--color-success-fg)",
  Suspended: "var(--color-danger-fg)",
  Pending: "var(--color-warning-fg)",
};

export default function AdminUsersPage() {
  const { users, loading, addUser } = useAdmin();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<(typeof roleFilters)[number]>("All");
  const [creating, setCreating] = useState(false);

  if (loading) {
    return (
      <AppPage title="User management" subtitle="All accounts, roles and permissions">
        <Loading />
      </AppPage>
    );
  }

  const q = search.trim().toLowerCase();
  const filtered = users.filter(
    (u) => (roleFilter === "All" || u.role === roleFilter) && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.includes(q))
  );

  return (
    <AppPage title="User management" subtitle="All accounts, roles and permissions">
      <div className="flex flex-col gap-4 max-w-[1240px]">
        <div className="flex justify-end">
          <Button onClick={() => setCreating(true)}>+ New user</Button>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or ID…"
            className="h-10 flex-1 min-w-[260px] rounded-[10px] border border-[var(--color-border-2)] px-3.5 bg-white"
          />
          <div className="flex gap-1.5 bg-[var(--color-border-3)] p-1 rounded-[10px]">
            {roleFilters.map((r) => {
              const on = roleFilter === r;
              return (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className="h-8 px-3.5 rounded-lg border-none text-[13px] font-semibold cursor-pointer"
                  style={{ background: on ? "#fff" : "transparent", color: on ? "#111A2B" : "var(--color-text-muted)", boxShadow: on ? "0 1px 2px rgba(16,24,40,.1)" : "none" }}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        <Card padding="p-0" className="overflow-hidden">
          <div
            className="grid gap-3 px-5 py-2.5 bg-[var(--color-card-alt)] border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide"
            style={{ gridTemplateColumns: "2fr 1fr 1.6fr 1fr 0.9fr 110px" }}
          >
            <div>User</div>
            <div>Role</div>
            <div>Permissions</div>
            <div>Last access</div>
            <div>Status</div>
            <div />
          </div>
          {filtered.map((u) => (
            <div
              key={u.id}
              className="grid gap-3 px-5 py-3.5 border-b border-[var(--color-border-3)] items-center hover:bg-[var(--color-card-alt)]"
              style={{ gridTemplateColumns: "2fr 1fr 1.6fr 1fr 0.9fr 110px" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-[34px] h-[34px] rounded-full grid place-items-center text-xs font-bold" style={roleAvatarStyle[u.role]}>
                  {initials(u.name)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{u.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{u.email}</div>
                </div>
              </div>
              <div>
                <Badge tone={roleTone[u.role]}>{u.role}</Badge>
              </div>
              <div className="text-xs text-[var(--color-text-muted-2)]">{u.perms}</div>
              <div className="font-mono text-xs text-[var(--color-text-muted-2)]">{u.last}</div>
              <div className="text-xs font-semibold" style={{ color: statusColor[u.status] }}>
                {u.status}
              </div>
              <div className="flex justify-end">
                <Button href={`/admin/${u.id}`} variant="secondary" size="xs">
                  Manage
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-12 text-center text-[var(--color-text-muted)] text-sm">No users match &ldquo;{search}&rdquo;.</div>}
          <div className="px-5 py-3.5 text-xs text-[var(--color-text-muted)]">
            {filtered.length} of {users.length} accounts
          </div>
        </Card>
      </div>

      {creating && (
        <CreateUserModal
          onSave={async (input) => {
            await addUser(input);
            showToast(`Account created for ${input.name}.`);
            setCreating(false);
          }}
          onClose={() => setCreating(false)}
        />
      )}
    </AppPage>
  );
}
