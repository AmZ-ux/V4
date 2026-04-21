import { TrendingUp } from "lucide-react";

import { Card } from "@/components/common/Card";
import { formatBRL } from "@/utils/currency";

export function PaymentsSummary({ received, paid, total }: { received: number; paid: number; total: number }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
            <TrendingUp className="h-5 w-5 text-brand-700" />
          </span>
          <div>
            <p className="text-[13px] text-ink-500">Recebido</p>
            <p className="text-h2 font-extrabold text-ink-900">{formatBRL(received)}</p>
          </div>
        </div>
        <p className="text-[14px] font-semibold text-brand-700">Pagos {paid}/{total}</p>
      </div>
    </Card>
  );
}
