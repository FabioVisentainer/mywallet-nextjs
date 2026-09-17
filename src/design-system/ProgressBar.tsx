interface ProgressBarProps {
  /** 0-100 */
  value: number;
  color?: string;
  trackColor?: string;
  /** Tailwind height utility, e.g. "h-2" (default). */
  height?: string;
  className?: string;
}

export function ProgressBar({ value, color = "var(--color-brand)", trackColor = "var(--color-border-3)", height = "h-2", className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`${height} rounded-full overflow-hidden ${className || ""}`} style={{ background: trackColor }}>
      <div className="h-full rounded-full transition-[width] duration-200" style={{ background: color, width: `${pct}%` }} />
    </div>
  );
}
