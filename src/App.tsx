import { useEffect } from "react";

import { AppRouter } from "@/router";
import { useAuthStore } from "@/store/useAuthStore";
import { usePaymentStore } from "@/store/usePaymentStore";

function AppBootstrap() {
  const token = useAuthStore((state) => state.token);
  const ready = useAuthStore((state) => state.ready);
  const logout = useAuthStore((state) => state.logout);
  const hydrateFromServer = usePaymentStore((state) => state.hydrateFromServer);
  const clearPayments = usePaymentStore((state) => state.clear);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      clearPayments();
      return;
    }

    hydrateFromServer().catch(() => {
      logout();
      clearPayments();
    });
  }, [ready, token, hydrateFromServer, clearPayments, logout]);

  return null;
}

export default function App() {
  return (
    <>
      <AppBootstrap />
      <AppRouter />
    </>
  );
}

