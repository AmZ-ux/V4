import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Mode = "current" | "previous" | "custom";

interface MonthSegmentedControlProps {
  currentMonth: number;
  selectedMonth: number;
  onChange: (month: number) => void;
  onOpenPicker: () => void;
}

export function MonthSegmentedControl({ currentMonth, selectedMonth, onChange, onOpenPicker }: MonthSegmentedControlProps) {
  const mode: Mode =
    selectedMonth === currentMonth ? "current" : selectedMonth === Math.max(1, currentMonth - 1) ? "previous" : "custom";

  const months = Array.from({ length: 12 }, (_, index) => index + 1);

  return (
    <div className="space-y-2">
      <div className="flex rounded-pill bg-ink-100 p-1">
        <button
          type="button"
          onClick={() => onChange(currentMonth)}
          className={`h-10 flex-1 rounded-pill text-[13px] font-semibold ${mode === "current" ? "bg-white text-ink-900 shadow-card" : "text-ink-500"}`}
        >
          Mês atual
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.max(1, currentMonth - 1))}
          className={`h-10 flex-1 rounded-pill text-[13px] font-semibold ${mode === "previous" ? "bg-white text-ink-900 shadow-card" : "text-ink-500"}`}
        >
          Mês passado
        </button>
        <button
          type="button"
          onClick={onOpenPicker}
          className={`h-10 flex-1 rounded-pill text-[13px] font-semibold ${mode === "custom" ? "bg-white text-ink-900 shadow-card" : "text-ink-500"}`}
        >
          Escolher...
        </button>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {months.map((month) => {
          const active = month === selectedMonth;
          const label = format(new Date(2026, month - 1, 1), "MMM", { locale: ptBR });
          return (
            <button
              key={month}
              type="button"
              aria-label={`Selecionar mês ${label}`}
              onClick={() => onChange(month)}
              className={`shrink-0 rounded-pill px-3 py-1.5 text-[12px] font-semibold uppercase ${active ? "bg-brand-700 text-white" : "bg-white text-ink-500 shadow-card"}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
