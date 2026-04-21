import { useMemo, useState } from "react";

import { usePaymentStore } from "@/store/usePaymentStore";

export function usePayments() {
  const currentMonth = usePaymentStore((state) => state.currentMonth);
  const monthPayments = usePaymentStore((state) => state.monthPayments);
  const markAsPaid = usePaymentStore((state) => state.markAsPaid);
  const restorePaymentDate = usePaymentStore((state) => state.restorePaymentDate);
  const totalReceivedInMonth = usePaymentStore((state) => state.totalReceivedInMonth);
  const paidCountInMonth = usePaymentStore((state) => state.paidCountInMonth);

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth.mes);

  const rows = useMemo(() => monthPayments(selectedMonth, currentMonth.ano), [monthPayments, selectedMonth, currentMonth.ano]);

  return {
    selectedMonth,
    setSelectedMonth,
    rows,
    markAsPaid,
    restorePaymentDate,
    received: totalReceivedInMonth(selectedMonth, currentMonth.ano),
    paid: paidCountInMonth(selectedMonth, currentMonth.ano),
    total: rows.length,
    month: currentMonth,
  };
}
