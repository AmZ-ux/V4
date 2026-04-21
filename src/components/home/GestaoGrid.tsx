import { CreditCard, MessageCircle, UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GestaoGridProps {
  totalPassengers: number;
  paid: number;
  total: number;
}

export function GestaoGrid({ totalPassengers, paid, total }: GestaoGridProps) {
  const navigate = useNavigate();

  const items = [
    { title: "Passageiros", subtitle: `${totalPassengers} cadastrados`, Icon: Users, to: "/passageiros", active: true },
    { title: "Pagamentos", subtitle: `${paid}/${total} pagos`, Icon: CreditCard, to: "/pagamentos", active: false },
    { title: "Novo passageiro", subtitle: "Cadastrar novo", Icon: UserPlus, to: "/passageiros?new=1", active: false },
    { title: "Portal", subtitle: "Área do passageiro", Icon: MessageCircle, to: "/portal", active: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <button
          key={item.title}
          type="button"
          aria-label={item.title}
          onClick={() => navigate(item.to)}
          className={`flex h-[104px] flex-col justify-between rounded-card p-4 text-left ${item.active ? "bg-brand-700 text-white" : "bg-white text-ink-900 shadow-card"}`}
        >
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${item.active ? "bg-white/15" : "bg-brand-100"}`}>
            <item.Icon className={`h-5 w-5 ${item.active ? "text-white" : "text-brand-700"}`} />
          </span>
          <div>
            <p className="text-[15px] font-bold leading-tight">{item.title}</p>
            <p className={`text-[12px] ${item.active ? "text-white/85" : "text-ink-500"}`}>{item.subtitle}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
