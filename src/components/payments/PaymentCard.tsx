import { AvatarInitials } from "@/components/common/AvatarInitials";
import { StatusBadge } from "@/components/common/StatusBadge";
import { QuickPayButton } from "@/components/payments/QuickPayButton";
import type { PaymentWithPassenger } from "@/store/usePaymentStore";
import { formatBRL } from "@/utils/currency";
import { formatDMY } from "@/utils/date";

interface PaymentCardProps {
  row: PaymentWithPassenger;
  onPay: () => void;
}

export function PaymentCard({ row, onPay }: PaymentCardProps) {
  return (
    <article className="rounded-card bg-white p-3 shadow-card">
      <div className="flex items-center gap-3">
        <AvatarInitials nome={row.passenger.nome} size={48} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-ink-900">{row.passenger.nome}</p>
          <p className="text-[13px] text-ink-500">{row.passenger.rota} • {formatBRL(row.payment.valor)}</p>
        </div>
        <StatusBadge status={row.status} />
        {row.status === "atrasado" ? <QuickPayButton onClick={onPay} /> : null}
      </div>
      {row.payment.dataPagamento ? <p className="mt-2 text-[12px] text-brand-700">Pago em {formatDMY(row.payment.dataPagamento)}</p> : null}
    </article>
  );
}
