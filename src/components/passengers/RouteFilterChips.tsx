import type { Route } from "@/types";
import type { RouteFilter } from "@/hooks/usePassengers";

const chips: RouteFilter[] = ["Todas", "IFPI", "UESPI", "UFPI", "CONTRATOS"];

export function RouteFilterChips({ value, onChange }: { value: RouteFilter; onChange: (value: RouteFilter) => void }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {chips.map((chip) => {
        const active = chip === value;
        return (
          <button
            key={chip}
            type="button"
            onClick={() => onChange(chip)}
            className={`shrink-0 rounded-pill px-4 py-2 text-[13px] font-medium ${active ? "bg-brand-700 text-white" : "bg-ink-100 text-ink-500"}`}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}

const _typeCheck: Route[] = ["IFPI", "UESPI", "UFPI", "CONTRATOS"];
void _typeCheck;
