import { Card } from "@/components/common/Card";
import { SegmentedProgressBar } from "@/components/common/SegmentedProgressBar";
import { formatBRL, formatMonthYearCaps } from "@/utils/currency";

interface MonthSummaryCardProps {
  month: number;
  year: number;
  received: number;
  expected: number;
  paid: number;
  pending: number;
  overdue: number;
  total: number;
}

export function MonthSummaryCard(props: MonthSummaryCardProps) {
  const percent = props.expected > 0 ? Math.round((props.received / props.expected) * 100) : 0;

  return (
    <Card elevated className="mx-4 -mt-8">
      <div role="status" className="space-y-2">
        <p className="text-eyebrow font-medium uppercase tracking-[0.08em] text-ink-500">{formatMonthYearCaps(props.month, props.year)}</p>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-hero font-extrabold text-ink-900">{formatBRL(props.received)}</p>
          <p className="text-[15px] font-bold text-brand-700">{percent}%</p>
        </div>
        <p className="text-[13px] text-ink-500">de {formatBRL(props.expected)} esperado</p>
      </div>

      <div className="mt-4">
        <SegmentedProgressBar
          segments={[
            { value: props.paid, color: "#1E9E5B" },
            { value: props.pending, color: "#E5B94A" },
            { value: props.overdue, color: "#E63946" },
          ]}
        />

        <div className="mt-[10px] grid grid-cols-3 gap-2 text-[13px] text-ink-500">
          <p className="flex items-center justify-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            <span className="font-bold text-ink-900">{props.paid}</span> Pagos
          </p>
          <p className="flex items-center justify-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-warn-500" />
            <span className="font-bold text-ink-900">{props.pending}</span> Pendentes
          </p>
          <p className="flex items-center justify-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-danger-500" />
            <span className="font-bold text-ink-900">{props.overdue}</span> Atrasados
          </p>
        </div>
      </div>
    </Card>
  );
}
