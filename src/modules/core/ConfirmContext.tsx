"use client";

import {createContext, type ReactNode, useCallback, useContext, useState} from "react";
import type {ConfirmData} from "./types";

interface ConfirmContextValue {
  confirmData: ConfirmData | null;
  askConfirm: (data: ConfirmData) => void;
  closeConfirm: () => void;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);

  const askConfirm = useCallback((data: ConfirmData) => setConfirmData(data), []);
  const closeConfirm = useCallback(() => setConfirmData(null), []);

  return (
    <ConfirmContext.Provider value={{ confirmData, askConfirm, closeConfirm }}>
      {children}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
