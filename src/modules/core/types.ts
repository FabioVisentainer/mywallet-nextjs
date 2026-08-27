export type Role = "investor" | "analyst" | "admin" | null;

export type PlanName = "Standard" | "Platinum" | "Black";

/** Client segment — orthogonal to Role (what you can do) and PlanName (what your subscription unlocks).
 *  Institutional accounts unlock the institutional/ module; everyone else never sees it. */
export type AccountType = "Individual" | "Institutional";

export type ToastKind = "ok" | "err";

export interface ToastState {
  msg: string;
  kind: ToastKind;
}

export interface ConfirmData {
  title: string;
  body: string;
  detail?: string;
  cta: string;
  onConfirm: () => void;
}

export interface FieldState {
  value: string;
  err: string;
  bc: string;
  bg: string;
}
