import type { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> {
  label: ReactNode;
  error?: string;
  className?: string;
}

export function Checkbox({ label, error, className, ...rest }: CheckboxProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex gap-2.5 items-start text-[13px] text-[var(--color-text-muted-2)] cursor-pointer">
        <input type="checkbox" {...rest} className={`w-4 h-4 mt-0.5 accent-[var(--color-brand)] ${className || ""}`} />
        <span>{label}</span>
      </label>
      {error && <div className="text-xs text-[var(--color-danger-fg)]">{error}</div>}
    </div>
  );
}
