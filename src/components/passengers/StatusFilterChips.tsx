import type { StatusFilter } from "@/hooks/usePassengers";

const chips: StatusFilter[] = ["Todos", "pago", "pendente", "atrasado"];

const labels: Record<StatusFilter, string> = {
  Todos: "Todos",
  pago: "Pagos",
  pendente: "Pendentes",
  atrasado: "Atrasados",
};

export function StatusFilterChips({ value, onChange }: { value: StatusFilter; onChange: (value: StatusFilter) => void }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {chips.map((chip) => {
        const active = chip === value;
        return (
          <button
            key={chip}
            type="button"
            onClick={() => onChange(chip)}
            className={`shrink-0 rounded-pill px-4 py-2 text-[13px] font-medium ${active ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-500"}`}
          >
            {labels[chip]}
          </button>
        );
      })}
    </div>
  );
}
