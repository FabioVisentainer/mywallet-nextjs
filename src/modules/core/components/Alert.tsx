import type { ReactNode } from "react";

export type AlertTone = "danger" | "warning" | "brand" | "success";

const TONE_STYLES: Record<AlertTone, { bg: string; border: string; iconBg: string; iconFg: string; text: string }> = {
  danger: {
    bg: "var(--color-danger-bg)",
    border: "var(--color-danger-border)",
    iconBg: "var(--color-danger)",
    iconFg: "#fff",
    text: "var(--color-danger-fg)",
  },
  warning: {
    bg: "var(--color-warning-bg)",
    border: "var(--color-warning-border)",
    iconBg: "var(--color-warning)",
    iconFg: "#fff",
    text: "var(--color-warning-fg-2)",
  },
  brand: {
    bg: "var(--color-brand-soft-bg)",
    border: "var(--color-brand-soft-border)",
    iconBg: "var(--color-brand)",
    iconFg: "#fff",
    text: "var(--color-text-muted-3)",
  },
  success: {
    bg: "var(--color-success-bg)",
    border: "var(--color-border)",
    iconBg: "var(--color-success)",
    iconFg: "#fff",
    text: "var(--color-success-fg)",
  },
};

interface AlertProps {
  tone?: AlertTone;
  icon?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Icon + message banner — form validation errors, plan-lock notices, warnings. */
export function Alert({ tone = "danger", icon, title, children, action, className }: AlertProps) {
  const s = TONE_STYLES[tone];
  return (
    <div className={`flex gap-3 rounded-xl p-3.5 border ${className || ""}`} style={{ background: s.bg, borderColor: s.border }}>
      <div className="w-5 h-5 rounded-full grid place-items-center text-[13px] font-bold shrink-0" style={{ background: s.iconBg, color: s.iconFg }}>
        {icon ?? "!"}
      </div>
      <div className="flex-1 text-[13px]" style={{ color: s.text }}>
        {title && <div className="font-bold mb-0.5">{title}</div>}
        {children}
      </div>
      {action}
    </div>
  );
}
