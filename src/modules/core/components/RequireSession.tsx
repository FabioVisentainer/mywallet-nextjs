"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "../SessionContext";

const PUBLIC_APP_PATHS = ["/news"];

/** Screens that need a signed-in role, mirroring the original prototype's `hasSidebar`/isGuest gating. */
export function RequireSession({ children }: { children: React.ReactNode }) {
  const { role } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_APP_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    if (!role && !isPublic) router.replace("/");
  }, [role, isPublic, router]);

  if (!role && !isPublic) return null;
  return <>{children}</>;
}
