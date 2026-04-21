import { useMemo, useState } from "react";

import type { PaymentStatus, Route } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import { usePaymentStore } from "@/store/usePaymentStore";
import { normalizeText } from "@/utils/normalizeText";
import { digitsOnly } from "@/utils/phone";

export type RouteFilter = "Todas" | Route;
export type StatusFilter = "Todos" | "pago" | "pendente" | "atrasado";

export function usePassengers() {
  const monthPayments = usePaymentStore((state) => state.monthPayments);

  const [query, setQuery] = useState("");
  const [routeFilter, setRouteFilter] = useState<RouteFilter>("Todas");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todos");
  const debouncedQuery = useDebounce(query, 200);

  const rows = monthPayments();

  const filtered = useMemo(() => {
    const base = rows.filter((item) => {
      const routeOk = routeFilter === "Todas" || item.passenger.rota === routeFilter;
      const statusOk = statusFilter === "Todos" || item.status === (statusFilter as PaymentStatus);
      return routeOk && statusOk;
    });

    if (!debouncedQuery.trim()) return base;
    const normalizedQuery = normalizeText(debouncedQuery);
    const digitsQuery = digitsOnly(debouncedQuery);

    return base.filter((item) => {
      const normalizedName = normalizeText(item.passenger.nome);
      const phoneDigits = digitsOnly(item.passenger.telefone);
      return normalizedName.includes(normalizedQuery) || (digitsQuery.length > 0 && phoneDigits.includes(digitsQuery));
    });
  }, [rows, debouncedQuery, routeFilter, statusFilter]);

  return {
    query,
    setQuery,
    routeFilter,
    setRouteFilter,
    statusFilter,
    setStatusFilter,
    total: rows.length,
    passengers: filtered,
  };
}
