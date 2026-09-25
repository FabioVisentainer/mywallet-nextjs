import type {ReactNode} from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-start justify-center py-12 px-6">
      <div className="w-full flex flex-col gap-5">
        <div className="flex items-center gap-2.5 font-extrabold text-lg">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-brand)] text-white grid place-items-center text-sm">M</div>
          MyWallet
        </div>
        {children}
      </div>
    </div>
  );
}
