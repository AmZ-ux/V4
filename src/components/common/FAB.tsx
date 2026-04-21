import type { LucideIcon } from "lucide-react";

export function FAB({ onClick, icon: Icon }: { onClick: () => void; icon: LucideIcon }) {
  return (
    <button
      aria-label="Novo passageiro"
      type="button"
      onClick={onClick}
      className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-brand-700 text-white shadow-fab"
    >
      <Icon className="h-[22px] w-[22px]" />
    </button>
  );
}
