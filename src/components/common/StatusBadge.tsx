import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

import type { PaymentStatus } from "@/types";

const config = {
  pago: { text: "Pago", cls: "bg-brand-100 text-brand-700", Icon: CheckCircle2 },
  pendente: { text: "Pendente", cls: "bg-warn-100 text-warn-700", Icon: Clock },
  atrasado: { text: "Atrasado", cls: "bg-danger-100 text-danger-700", Icon: AlertTriangle },
} as const;

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const item = config[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[13px] font-semibold ${item.cls}`.trim()}>
      <item.Icon className="h-[14px] w-[14px]" />
      {item.text}
    </span>
  );
}
