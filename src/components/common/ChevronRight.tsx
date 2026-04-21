import { ChevronRight as ChevronRightIcon } from "lucide-react";

export function ChevronRight({ className = "" }: { className?: string }) {
  return <ChevronRightIcon aria-hidden="true" className={`h-4 w-4 text-ink-500 ${className}`.trim()} />;
}
