import { usePaymentStore } from "@/store/usePaymentStore";

export function useDashboardStats() {
  const expected = usePaymentStore((state) => state.totalExpectedInMonth);
  const received = usePaymentStore((state) => state.totalReceivedInMonth);
  const paid = usePaymentStore((state) => state.paidCountInMonth);
  const pending = usePaymentStore((state) => state.pendingCountInMonth);
  const overdue = usePaymentStore((state) => state.overdueCountInMonth);
  const routeSummary = usePaymentStore((state) => state.routeSummary);
  const monthPayments = usePaymentStore((state) => state.monthPayments);

  return {
    totalExpectedInMonth: expected(),
    totalReceivedInMonth: received(),
    paidCount: paid(),
    pendingCount: pending(),
    overdueCount: overdue(),
    totalCount: monthPayments().length,
    routeSummary: routeSummary(),
    overdueRows: monthPayments().filter((item) => item.status === "atrasado"),
  };
}
