import { ChevronRight } from "@/components/common/ChevronRight";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatBRL } from "@/utils/currency";
import type { PaymentWithPassenger } from "@/store/usePaymentStore";

export function OverdueList({ rows }: { rows: PaymentWithPassenger[] }) {
  return (
    <div className="space-y-[10px]">
      {rows.slice(0, 3).map((item) => (
        <button
          key={item.payment.id}
          type="button"
          className="flex w-full items-center gap-3 rounded-card bg-white p-3 text-left shadow-card"
          onClick={() => console.log("detalhes", item.passenger.id)}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-ink-900">{item.passenger.nome}</p>
            <p className="text-[13px] text-ink-500">{item.passenger.telefone} • {formatBRL(item.payment.valor)}</p>
          </div>
          <StatusBadge status="atrasado" />
          <ChevronRight className="text-ink-400" />
        </button>
      ))}
    </div>
  );
}
