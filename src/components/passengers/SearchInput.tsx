import { Search } from "lucide-react";

export function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-pill bg-white px-4 py-3 shadow-card">
      <Search className="h-4 w-4 text-ink-400" />
      <input
        aria-label="Buscar passageiro"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border-0 bg-transparent text-[14px] text-ink-900 outline-none placeholder:text-ink-400"
        placeholder="Buscar passageiro..."
      />
    </label>
  );
}
