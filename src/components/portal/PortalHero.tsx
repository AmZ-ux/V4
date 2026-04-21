import { CircleUserRound } from "lucide-react";

export function PortalHero() {
  return (
    <header className="rounded-card-lg bg-[linear-gradient(135deg,#0A4B2F_0%,#127A4B_100%)] p-5 text-white shadow-card-hi">
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
        <CircleUserRound className="h-6 w-6" />
      </span>
      <h1 className="text-h1 font-extrabold">Portal do Passageiro</h1>
      <p className="mt-1 text-[14px] text-white/85">Consulte seus pagamentos</p>
    </header>
  );
}
