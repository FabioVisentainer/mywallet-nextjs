"use client";

import type { ReactNode } from "react";

interface Props {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
}

export function Modal({ onClose, children, maxWidth = 460 }: Props) {
  return (
    <div
      className="fixed inset-0 bg-[rgba(17,26,43,.45)] flex items-center justify-center p-6 z-60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full p-6.5 flex flex-col gap-4.5 shadow-[0_24px_60px_rgba(17,26,43,.28)] animate-modal-in"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
