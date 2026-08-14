"use client";

import { useToast } from "../ToastContext";

export function Toast() {
  const { toast } = useToast();
  if (!toast) return null;

  const color = toast.kind === "err" ? "#D92D20" : "#12B76A";
  const icon = toast.kind === "err" ? "!" : "✓";

  return (
    <div className="fixed right-6 bottom-6 z-80 flex items-center gap-3 bg-[var(--color-ink)] text-white rounded-xl px-4.5 py-3.5 shadow-[0_16px_40px_rgba(17,26,43,.3)] animate-toast-in">
      <div className="w-[22px] h-[22px] rounded-full grid place-items-center text-xs font-bold" style={{ background: color }}>
        {icon}
      </div>
      <div className="text-sm font-semibold">{toast.msg}</div>
    </div>
  );
}
