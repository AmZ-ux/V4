import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore, type UserRole } from "@/store/useAuthStore";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
    </div>
  );
}

export function ProtectedRoute({ children, role }: { children: ReactNode; role?: UserRole }) {
  const ready = useAuthStore((state) => state.ready);
  const user = useAuthStore((state) => state.user);

  if (!ready) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/dashboard-admin" : "/passageiro"} replace />;
  }

  return <>{children}</>;
}

export function RedirectByRole() {
  const ready = useAuthStore((state) => state.ready);
  const user = useAuthStore((state) => state.user);

  if (!ready) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={user.role === "admin" ? "/dashboard-admin" : "/passageiro"} replace />;
}
