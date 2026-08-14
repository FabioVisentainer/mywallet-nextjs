import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Tailwind padding utility, e.g. "p-5" (default) or "p-6.5". */
  padding?: string;
  style?: CSSProperties;
}

/** The white bordered rounded container used for stat cards, list rows, form panels, etc. */
export function Card({ children, className, padding = "p-5", style }: CardProps) {
  return <div className={`bg-white border border-[var(--color-border)] rounded-[14px] ${padding} ${className || ""}`} style={style}>{children}</div>;
}
