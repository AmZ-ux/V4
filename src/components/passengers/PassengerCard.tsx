import { ChevronRight } from "@/components/common/ChevronRight";
import { AvatarInitials } from "@/components/common/AvatarInitials";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { PaymentWithPassenger } from "@/store/usePaymentStore";
import { formatBRL } from "@/utils/currency";

export function PassengerCard({ row, onClick }: { row: PaymentWithPassenger; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-card bg-white p-3 text-left shadow-card"
    >
      <AvatarInitials nome={row.passenger.nome} size={52} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-ink-900">{row.passenger.nome}</p>
        <p className="text-[13px] text-ink-500">{row.passenger.telefone}</p>
        <p className="text-[13px] text-ink-500">{row.passenger.rota} • {formatBRL(row.passenger.mensalidade)}</p>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={row.status} />
        <ChevronRight className="text-ink-400" />
      </div>
    </button>
  );
}
