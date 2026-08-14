export type Role = "investor" | "analyst" | "admin" | null;

export type PlanName = "Standard" | "Platinum" | "Black";

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
