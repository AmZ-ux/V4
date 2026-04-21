import { useMemo, useState } from "react";

import { Toast } from "@/components/common/Toast";
import { ScreenHeaderGreen } from "@/components/common/ScreenHeaderGreen";
import { MonthSegmentedControl } from "@/components/payments/MonthSegmentedControl";
import { PaymentCard } from "@/components/payments/PaymentCard";
import { PaymentsSummary } from "@/components/payments/PaymentsSummary";
import { usePayments } from "@/hooks/usePayments";
import type { PaymentWithPassenger } from "@/store/usePaymentStore";
import { formatBRL, formatMonthYearTitle } from "@/utils/currency";

interface UndoPayload {
  passengerId: string;
  previousDate: string | null;
  month: number;
}

export function PaymentsPage() {
  const { selectedMonth, setSelectedMonth, rows, markAsPaid, restorePaymentDate, received, paid, total, month } = usePayments();
  const [undo, setUndo] = useState<UndoPayload | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, index) => index + 1), []);

  const onPay = (row: PaymentWithPassenger) => {
    const confirmed = window.confirm(`Confirmar pagamento de ${row.passenger.nome} (${formatBRL(row.payment.valor)})?`);
    if (!confirmed) return;

    markAsPaid(row.passenger.id, selectedMonth, month.ano);

    setUndo({
      passengerId: row.passenger.id,
      previousDate: row.payment.dataPagamento,
      month: selectedMonth,
    });

    window.setTimeout(() => {
      setUndo((current) => (current?.passengerId === row.passenger.id && current.month === selectedMonth ? null : current));
    }, 5000);
  };

  const handleUndo = () => {
    if (!undo) return;
    restorePaymentDate(undo.passengerId, undo.month, undo.previousDate, month.ano);
    setUndo(null);
  };

  return (
    <div>
      {undo ? <Toast message="Pagamento registrado" actionLabel="Desfazer" onAction={handleUndo} /> : null}

      <ScreenHeaderGreen className="px-screen pb-5 pt-12">
        <h1 className="text-h1 font-extrabold text-white">Pagamentos</h1>
        <p className="text-[13px] text-white/85">{formatMonthYearTitle(selectedMonth, month.ano)}</p>
      </ScreenHeaderGreen>

      <div className="px-screen pt-4">
        <div className="space-y-3">
          <MonthSegmentedControl
            currentMonth={month.mes}
            selectedMonth={selectedMonth}
            onChange={setSelectedMonth}
            onOpenPicker={() => setPickerOpen(true)}
          />
          <PaymentsSummary received={received} paid={paid} total={total} />
        </div>

        <div className="mt-4 space-y-gap">
          {rows.length === 0 ? (
            <div className="rounded-card bg-white p-5 text-center text-[14px] text-ink-500 shadow-card">
              Sem pagamentos registrados neste mes
            </div>
          ) : (
            rows.map((row) => (
              <PaymentCard
                key={row.payment.id}
                row={row}
                onPay={() => onPay(row)}
              />
            ))
          )}
        </div>
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-3 pb-0">
          <div className="w-full max-w-[480px] rounded-t-[24px] bg-white p-4 pb-8">
            <h2 className="text-h2 font-bold text-ink-900">Escolher mes</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {monthOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSelectedMonth(item);
                    setPickerOpen(false);
                  }}
                  className={`h-10 rounded-pill text-[13px] font-semibold ${selectedMonth === item ? "bg-brand-700 text-white" : "bg-ink-100 text-ink-700"}`}
                >
                  {new Date(month.ano, item - 1, 1).toLocaleString("pt-BR", { month: "short" })}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="mt-3 h-11 w-full rounded-pill border border-ink-200 text-[14px] font-semibold text-ink-500"
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
