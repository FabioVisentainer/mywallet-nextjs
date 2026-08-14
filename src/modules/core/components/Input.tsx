import type { InputHTMLAttributes, ReactNode } from "react";
import { FieldShell, fieldBorderStyle } from "./FieldShell";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  required?: boolean;
  error?: string;
  /** Show the red border without inline error text — use when a shared banner already explains the error. */
  invalid?: boolean;
  hint?: ReactNode;
  mono?: boolean;
  className?: string;
}

export function Input({ label, required, error, invalid, hint, mono, className, ...rest }: InputProps) {
  return (
    <FieldShell label={label} required={required} error={error} hint={hint}>
      <input {...rest} className={`h-11 rounded-[10px] border px-3.5 ${mono ? "font-mono" : ""} ${className || ""}`} style={fieldBorderStyle(error, invalid)} />
    </FieldShell>
  );
}
