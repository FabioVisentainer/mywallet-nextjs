import type { CSSProperties, ReactNode } from "react";

interface FieldShellProps {
  label?: string;
  required?: boolean;
  error?: string;
  /** Extra note under the control, e.g. a success hint like "Strong password." */
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Label + control + error/hint wrapper shared by Input, Select and Textarea. */
export function FieldShell({ label, required, error, hint, children, className }: FieldShellProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className || ""}`}>
      {label && (
        <label className="text-[13px] font-semibold">
          {label} {required && <span className="text-[var(--color-danger)]">*</span>}
        </label>
      )}
      {children}
      {error && <div className="text-xs text-[var(--color-danger-fg)]">{error}</div>}
      {hint}
    </div>
  );
}

/** `invalid` drives the red border/background without necessarily showing inline error text (e.g. a shared banner already explains it). */
export function fieldBorderStyle(error?: string, invalid?: boolean): CSSProperties {
  const bad = invalid || !!error;
  return {
    borderColor: bad ? "var(--color-danger-border)" : "var(--color-border-2)",
    background: bad ? "#FFFBFA" : "#ffffff",
  };
}
