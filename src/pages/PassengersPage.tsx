import { useEffect, useMemo, useState, type ReactNode } from "react";
import { MessageCircle, Plus, SearchX, Trash2 } from "lucide-react";
import InputMask from "react-input-mask";
import { useSearchParams } from "react-router-dom";

import { FAB } from "@/components/common/FAB";
import { ScreenHeaderGreen } from "@/components/common/ScreenHeaderGreen";
import { PassengerCard } from "@/components/passengers/PassengerCard";
import { RouteFilterChips } from "@/components/passengers/RouteFilterChips";
import { SearchInput } from "@/components/passengers/SearchInput";
import { StatusFilterChips } from "@/components/passengers/StatusFilterChips";
import { usePassengers } from "@/hooks/usePassengers";
import { openWhatsApp } from "@/services/whatsapp";
import { usePaymentStore } from "@/store/usePaymentStore";
import type { PaymentWithPassenger } from "@/store/usePaymentStore";
import type { Route } from "@/types";

const routes: Route[] = ["IFPI", "UESPI", "UFPI", "CONTRATOS"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-[15px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20";

export function PassengersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const shouldOpenNew = searchParams.get("new") === "1";

  const { query, setQuery, routeFilter, setRouteFilter, statusFilter, setStatusFilter, total, passengers } = usePassengers();
  const addPassenger = usePaymentStore((state) => state.addPassenger);
  const deletePassenger = usePaymentStore((state) => state.deletePassenger);

  const [openNewModal, setOpenNewModal] = useState(false);
  const [selected, setSelected] = useState<PaymentWithPassenger | null>(null);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [rota, setRota] = useState<Route>("IFPI");
  const [mensalidade, setMensalidade] = useState("280");
  const [diaVencimento, setDiaVencimento] = useState("10");

  useEffect(() => {
    if (shouldOpenNew) setOpenNewModal(true);
  }, [shouldOpenNew]);

  const canSave = useMemo(() => {
    return nome.trim().length >= 3 && telefone.length === 15 && Number(mensalidade) > 0 && Number(diaVencimento) >= 1 && Number(diaVencimento) <= 28;
  }, [nome, telefone, mensalidade, diaVencimento]);

  const groupedPassengers = useMemo(() => {
    if (routeFilter !== "Todas") {
      return [{ route: routeFilter, rows: passengers }];
    }

    return routes
      .map((item) => ({ route: item, rows: passengers.filter((row) => row.passenger.rota === item) }))
      .filter((group) => group.rows.length > 0);
  }, [passengers, routeFilter]);

  const closeNew = () => {
    setOpenNewModal(false);
    setSearchParams({});
  };

  const savePassenger = () => {
    if (!canSave) return;
    addPassenger({
      nome: nome.trim(),
      telefone,
      rota,
      mensalidade: Number(mensalidade),
      diaVencimento: Number(diaVencimento),
    });
    setNome("");
    setTelefone("");
    setRota("IFPI");
    setMensalidade("280");
    setDiaVencimento("10");
    closeNew();
  };

  return (
    <div>
      <ScreenHeaderGreen className="px-screen pb-5 pt-12">
        <div className="relative">
          <h1 className="text-h1 font-extrabold text-white">Passageiros</h1>
          <p className="text-[13px] text-white/85">{total} cadastrados</p>
          <div className="absolute right-0 top-0">
            <FAB onClick={() => setOpenNewModal(true)} icon={Plus} />
          </div>
        </div>
      </ScreenHeaderGreen>

      <div className="px-screen pt-4">
        <div className="space-y-3">
          <SearchInput value={query} onChange={setQuery} />
          <RouteFilterChips value={routeFilter} onChange={setRouteFilter} />
          <StatusFilterChips value={statusFilter} onChange={setStatusFilter} />
        </div>

        <div className="mt-4 space-y-gap">
          {passengers.length === 0 ? (
            <div className="rounded-card bg-ink-100 p-5 text-center text-ink-500">
              <SearchX className="mx-auto mb-2 h-5 w-5" />
              Nenhum passageiro encontrado
            </div>
          ) : (
            groupedPassengers.map((group) => (
              <section key={group.route}>
                {routeFilter === "Todas" ? (
                  <div className="sticky top-[60px] z-10 mb-2 rounded-pill bg-brand-50/95 px-3 py-1 text-[12px] font-semibold text-ink-700 backdrop-blur">
                    {group.route} • {group.rows.length} passageiro(s)
                  </div>
                ) : null}
                <div className="space-y-gap">
                  {group.rows.map((row) => <PassengerCard key={row.payment.id} row={row} onClick={() => setSelected(row)} />)}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {openNewModal ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-3 pb-0">
          <div className="w-full max-w-[480px] rounded-t-[24px] bg-white p-4 pb-8">
            <h2 className="text-h2 font-bold text-ink-900">Novo passageiro</h2>
            <div className="mt-3 space-y-2.5">
              <Field label="Nome">
                <input aria-label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Digite o nome completo" className={inputClassName} />
              </Field>

              <Field label="Telefone">
                <InputMask aria-label="Telefone" mask="(99) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className={inputClassName} />
              </Field>

              <Field label="Rota">
                <select aria-label="Rota" value={rota} onChange={(e) => setRota(e.target.value as Route)} className={inputClassName}>
                  {routes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>

              <Field label="Valor da mensalidade (R$)">
                <input aria-label="Mensalidade" value={mensalidade} onChange={(e) => setMensalidade(e.target.value)} placeholder="0,00" type="number" className={inputClassName} />
              </Field>

              <Field label="Dia de vencimento">
                <input
                  aria-label="Dia de vencimento"
                  value={diaVencimento}
                  onChange={(e) => setDiaVencimento(e.target.value)}
                  placeholder="1 a 28"
                  type="number"
                  min={1}
                  max={28}
                  className={inputClassName}
                />
              </Field>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button aria-label="Cancelar novo passageiro" type="button" onClick={closeNew} className="h-11 rounded-pill border border-ink-200 text-[14px] font-semibold text-ink-500">Cancelar</button>
              <button aria-label="Salvar passageiro" type="button" onClick={savePassenger} disabled={!canSave} className="h-11 rounded-pill bg-brand-700 text-[14px] font-semibold text-white disabled:opacity-50">Salvar</button>
            </div>
          </div>
        </div>
      ) : null}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-3 pb-0">
          <div className="w-full max-w-[480px] rounded-t-[24px] bg-white p-4 pb-8">
            <h2 className="text-h2 font-bold text-ink-900">{selected.passenger.nome}</h2>
            <p className="mt-1 text-[14px] text-ink-500">{selected.passenger.telefone}</p>
            <p className="text-[14px] text-ink-500">{selected.passenger.rota} • Vence dia {selected.passenger.diaVencimento}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button aria-label="Falar no WhatsApp" type="button" onClick={() => openWhatsApp(selected.passenger.telefone, `Oi ${selected.passenger.nome}!`)} className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-brand-200 text-[13px] font-semibold text-brand-700">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </button>
              <button aria-label="Fechar detalhes" type="button" onClick={() => setSelected(null)} className="h-11 rounded-pill border border-ink-200 text-[13px] font-semibold text-ink-500">Fechar</button>
              <button
                aria-label="Excluir passageiro"
                type="button"
                onClick={() => {
                  if (!window.confirm("Tem certeza que deseja remover este passageiro?")) return;
                  deletePassenger(selected.passenger.id);
                  setSelected(null);
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-danger-500 text-[13px] font-semibold text-white"
              >
                <Trash2 className="h-4 w-4" /> Excluir
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

