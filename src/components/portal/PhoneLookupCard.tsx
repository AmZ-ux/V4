import InputMask from "react-input-mask";
import { Search } from "lucide-react";

import { Card } from "@/components/common/Card";

interface PhoneLookupCardProps {
  phone: string;
  onPhoneChange: (value: string) => void;
  onSearch: () => void;
}

export function PhoneLookupCard({ phone, onPhoneChange, onSearch }: PhoneLookupCardProps) {
  return (
    <Card>
      <p className="mb-2 text-eyebrow uppercase tracking-[0.08em] text-ink-400">Digite seu telefone</p>
      <div className="flex items-center gap-2">
        <InputMask
          mask="(99) 99999-9999"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          className="h-[44px] flex-1 rounded-pill border border-ink-200 bg-brand-50 px-4 text-[14px] text-ink-900 outline-none"
          placeholder="(00) 00000-0000"
        />
        <button
          aria-label="Buscar telefone"
          type="button"
          onClick={onSearch}
          className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-brand-700 text-white"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </Card>
  );
}
