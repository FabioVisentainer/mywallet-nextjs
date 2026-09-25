import type { ReactNode, TextareaHTMLAttributes } from "react";
import { FieldShell, fieldBorderStyle } from "./FieldShell";

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  className?: string;
}

export function Textarea({ label, required, error, hint, className, ...rest }: TextareaProps) {
  return (
    <FieldShell label={label} required={required} error={error} hint={hint}>
      <textarea {...rest} className={`rounded-[10px] border px-3.5 py-3 leading-relaxed resize-y ${className || ""}`} style={fieldBorderStyle(error)} />
    </FieldShell>
  );
}
