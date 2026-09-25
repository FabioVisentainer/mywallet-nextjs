import type { CSSProperties, ReactNode } from "react";

export type BadgeTone = "brand" | "success" | "danger" | "warning" | "purple" | "neutral" | "dark";

const TONE_CLASSES: Record<BadgeTone, string> = {
  brand: "bg-[var(--color-brand-soft)] text-[var(--color-brand)]",
  success: "bg-[var(--color-success-bg)] text-[var(--color-success-fg)]",
  danger: "bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)]",
  warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)]",
  purple: "bg-[var(--color-purple-bg)] text-[var(--color-purple)]",
  neutral: "bg-[var(--color-border-3)] text-[var(--color-text-muted-2)]",
  dark: "bg-[var(--color-ink)] text-white",
};

interface BadgeProps {
  tone?: BadgeTone;
  uppercase?: boolean;
  children: ReactNode;
  className?: string;
  /** Escape hatch for one-off colors a tone doesn't cover (e.g. per-plan or per-rating dynamic pairs). */
  style?: CSSProperties;
}

/** Small rounded status/label pill — role badges, status pills, category tags, plan ribbons. */
export function Badge({ tone = "neutral", uppercase, children, className, style }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full",
        uppercase ? "uppercase tracking-wide" : "",
        style ? "" : TONE_CLASSES[tone],
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </span>
  );
}
