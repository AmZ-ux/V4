import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthPillSelectorProps {
  value: number;
  onChange: (month: number) => void;
}

export function MonthPillSelector({ value, onChange }: MonthPillSelectorProps) {
  const months = Array.from({ length: 12 }, (_, index) => index + 1);

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {months.map((month) => {
        const active = month === value;
        const label = format(new Date(2026, month - 1, 1), "MMM", { locale: ptBR });

        return (
          <button
            key={month}
            type="button"
            aria-label={`Selecionar mês ${label}`}
            onClick={() => onChange(month)}
            className={`shrink-0 rounded-pill px-4 py-2 text-[13px] font-semibold uppercase ${active ? "bg-brand-700 text-white" : "bg-white text-ink-500 shadow-card"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
