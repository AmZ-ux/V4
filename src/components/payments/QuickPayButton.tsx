import { Check } from "lucide-react";

export function QuickPayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Marcar pagamento como pago"
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-white"
    >
      <Check className="h-5 w-5" />
    </button>
  );
}
