import type { ReactNode, SelectHTMLAttributes } from "react";
import { FieldShell, fieldBorderStyle } from "./FieldShell";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Select({ label, required, error, hint, className, children, ...rest }: SelectProps) {
  return (
    <FieldShell label={label} required={required} error={error} hint={hint}>
      <select {...rest} className={`h-11 rounded-[10px] border px-3 bg-white ${className || ""}`} style={fieldBorderStyle(error)}>
        {children}
      </select>
    </FieldShell>
  );
}
