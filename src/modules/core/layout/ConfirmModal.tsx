"use client";

import {useConfirm} from "../ConfirmContext";
import {Modal} from "./Modal";

export function ConfirmModal() {
  const { confirmData, closeConfirm } = useConfirm();
  if (!confirmData) return null;

  return (
    <Modal onClose={closeConfirm}>
      <div className="flex flex-col gap-4.5">
        <div className="flex gap-3.5">
          <div className="w-[42px] h-[42px] rounded-xl bg-[var(--color-danger-bg)] text-[var(--color-danger)] grid place-items-center text-xl font-bold shrink-0">
            !
          </div>
          <div>
            <div className="text-[17px] font-extrabold">{confirmData.title}</div>
            <div className="text-sm text-[var(--color-text-muted-2)] leading-relaxed mt-1.5">{confirmData.body}</div>
          </div>
        </div>
        {confirmData.detail && (
          <div className="bg-[var(--color-card-alt)] border border-[var(--color-border)] rounded-[11px] p-3.5 text-[13px] text-[var(--color-text-muted-3)] font-mono">
            {confirmData.detail}
          </div>
        )}
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={closeConfirm}
            className="h-[42px] px-4.5 rounded-[10px] border border-[var(--color-border-2)] bg-white font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              confirmData.onConfirm();
              closeConfirm();
            }}
            className="h-[42px] px-5 rounded-[10px] border-none bg-[var(--color-danger)] text-white font-bold cursor-pointer hover:bg-[var(--color-danger-fg)]"
          >
            {confirmData.cta}
          </button>
        </div>
      </div>
    </Modal>
  );
}
