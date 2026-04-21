import { Bus, Search, SearchX, Shield } from "lucide-react";
import { useState } from "react";

import { SectionEyebrow } from "@/components/common/SectionEyebrow";
import { InfoActionCard } from "@/components/portal/InfoActionCard";
import { PhoneLookupCard } from "@/components/portal/PhoneLookupCard";
import { PortalHero } from "@/components/portal/PortalHero";
import { usePaymentStore } from "@/store/usePaymentStore";
import { formatBRL, formatMonthYearTitle } from "@/utils/currency";
import { digitsOnly } from "@/utils/phone";

export function PortalPage() {
  const findByPhone = usePaymentStore((state) => state.findByPhone);
  type LookupResult = Awaited<ReturnType<typeof findByPhone>>;

  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<LookupResult>(null);
  const [searched, setSearched] = useState(false);

  const onSearch = async () => {
    setSearched(true);
    if (digitsOnly(phone).length !== 11) {
      setResult(null);
      return;
    }

    const found = await findByPhone(phone);
    setResult(found);
  };

  return (
    <div className="px-screen pt-6">
      <PortalHero />

      <div className="mt-4">
        <PhoneLookupCard phone={phone} onPhoneChange={setPhone} onSearch={onSearch} />
      </div>

      {result ? (
        <div className="mt-3 rounded-card bg-white p-3 shadow-card">
          <p className="text-[16px] font-bold text-ink-900">{result.passenger.nome}</p>
          <p className="text-[13px] text-ink-500">{result.passenger.rota}</p>

          <div className="mt-3 space-y-2">
            {result.history.map((item) => (
              <div key={`${item.year}-${item.month}`} className="rounded-xl bg-ink-100 px-3 py-2">
                <p className="text-[13px] font-semibold text-ink-900">{formatMonthYearTitle(item.month, item.year)}</p>
                <p className="text-[12px] text-ink-600">{formatBRL(item.payment.valor)} • {item.status}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {searched && !result ? (
        <div className="mt-3 rounded-card bg-ink-100 p-5 text-center text-ink-500">
          <SearchX className="mx-auto mb-2 h-5 w-5" />
          Telefone não encontrado. Verifique o número e tente novamente.
        </div>
      ) : null}

      <SectionEyebrow>O QUE VOCÊ PODE FAZER</SectionEyebrow>
      <div className="space-y-gap">
        <InfoActionCard icon={Search} title="Consultar pagamentos" subtitle="Veja o status de suas mensalidades" />
        <InfoActionCard icon={Bus} title="Ver sua rota" subtitle="Informações do seu transporte" />
        <InfoActionCard icon={Shield} title="Dados protegidos" subtitle="Suas informações estão seguras" />
      </div>
    </div>
  );
}
