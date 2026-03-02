"use client";

import { useEffect, useMemo, useState } from "react";
import { getSessionUser } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";

type GuardState =
  | { status: "checking" }
  | { status: "authed"; role: UserRole }
  | { status: "unauthenticated" };

/** PUBLIC_INTERFACE */
export function useAuthGuard(requiredRole?: UserRole) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<GuardState>({ status: "checking" });

  const role = useMemo(() => {
    const user = getSessionUser();
    return user?.role;
  }, []);

  useEffect(() => {
    const user = getSessionUser();
    if (!user) {
      setState({ status: "unauthenticated" });
      router.replace(`/auth/login?next=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      setState({ status: "authed", role: user.role });
      router.replace("/");
      return;
    }

    setState({ status: "authed", role: user.role });
  }, [requiredRole, router, pathname]);

  return { state, role };
}
