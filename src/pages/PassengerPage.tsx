import { LogOut, MessageCircle, Home, CreditCard, ChevronRight, X, Bell, FileText, User } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/useAuthStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import { getInitials } from "@/utils/initials";
import { formatMonthYearTitle } from "@/utils/currency";
import { openWhatsApp } from "@/services/whatsapp";

function formatarValor(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type PassengerStatus = "pago" | "pendente" | "atrasado";

interface HistoryItem {
  month: number;
  year: number;
  mes: string;
  status: PassengerStatus;
  valor: number;
  dataPagamento: string | null;
}

function calcDiasParaVencer(diaVencimento: number, month: number, year: number): number {
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const vencimento = new Date(year, month - 1, diaVencimento);
  const diff = vencimento.getTime() - inicioHoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function PassengerPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const passengers = usePaymentStore((state) => state.passengers);
  const monthPayments = usePaymentStore((state) => state.monthPayments);
  const currentMonth = usePaymentStore((state) => state.currentMonth);

  const [activeTab, setActiveTab] = useState<"inicio" | "pagamentos" | "suporte">("inicio");
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);

  const passenger = passengers.find((item) => item.id === user?.passengerId) ?? null;
  const monthRow = useMemo(() => {
    if (!passenger) return null;
    return monthPayments(currentMonth.mes, currentMonth.ano).find((item) => item.passenger.id === passenger.id) ?? null;
  }, [passenger, monthPayments, currentMonth.mes, currentMonth.ano]);

  const historico = useMemo(() => {
    if (!passenger) return [];

    const rows: HistoryItem[] = [];

    for (let index = 0; index < 6; index += 1) {
      const refDate = new Date(currentMonth.ano, currentMonth.mes - 1 - index, 1);
      const month = refDate.getMonth() + 1;
      const year = refDate.getFullYear();
      const row = monthPayments(month, year).find((item) => item.passenger.id === passenger.id);
      if (!row) continue;

      rows.push({
        month,
        year,
        mes: formatMonthYearTitle(month, year),
        status: row.status,
        valor: row.payment.valor,
        dataPagamento: row.payment.dataPagamento,
      });
    }

    return rows;
  }, [passenger, currentMonth.ano, currentMonth.mes, monthPayments]);

  if (!passenger || !monthRow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-4 text-center text-sm text-[#6B7280]">
        Passageiro nao encontrado para o usuario autenticado.
      </div>
    );
  }

  const status = monthRow.status as PassengerStatus;
  const dataVencimento = `${String(passenger.diaVencimento).padStart(2, "0")}/${String(currentMonth.mes).padStart(2, "0")}/${currentMonth.ano}`;
  const diasParaVencer = calcDiasParaVencer(passenger.diaVencimento, currentMonth.mes, currentMonth.ano);

  const badgeByStatus = {
    pago: {
      label: "✓ PAGO",
      badgeClass: "bg-[#16A34A] text-white",
      cardClass: "border-green-200 bg-green-50",
    },
    pendente: {
      label: "⏳ PENDENTE",
      badgeClass: "bg-[#D97706] text-white",
      cardClass: "border-amber-200 bg-amber-50",
    },
    atrasado: {
      label: "⚠ ATRASADO",
      badgeClass: "bg-[#DC2626] text-white",
      cardClass: "border-red-200 bg-red-50",
    },
  } as const;

  const shouldShowAlert = status === "atrasado" || (status === "pendente" && diasParaVencer <= 5);

  function handlePagarAgora(month = currentMonth.mes, year = currentMonth.ano, action?: "receipt") {
    const extra = action ? `&action=${action}` : "";
    navigate(`/passageiro/pagamento?month=${month}&year=${year}${extra}`);
  }

  function handlePayHistoryMonth() {
    if (!selectedHistory) return;
    handlePagarAgora(selectedHistory.month, selectedHistory.year);
    setSelectedHistory(null);
  }

  function handleOpenWhatsApp() {
    openWhatsApp("(86) 99999-0000", "Ola! Preciso de ajuda com meu pagamento.");
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#F9FAFB] pb-28">
      <header className="bg-[#14B8A6] px-5 pb-6 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white">
              {getInitials(passenger.nome)}
            </div>
            <div>
              <p className="text-base font-semibold text-white">{passenger.nome}</p>
              <p className="text-sm text-white/80">{passenger.rota}</p>
            </div>
          </div>

          <button type="button" onClick={logout} className="rounded-full p-2 text-white/85" aria-label="Sair">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {activeTab === "inicio" ? (
        <div className="space-y-4 px-4 pt-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#14B8A6]" />
              <h2 className="text-sm font-bold text-[#111827]">Avisos</h2>
            </div>
            <ul className="space-y-2 text-sm text-[#374151]">
              <li className="rounded-xl bg-[#F9FAFB] px-3 py-2">Mensalidade vence todo dia {passenger.diaVencimento}.</li>
              <li className="rounded-xl bg-[#F9FAFB] px-3 py-2">Use apenas a chave PIX oficial: pix@minhavan.com.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-[#111827]">Atalhos</h2>
            <div className="grid grid-cols-1 gap-2">
              <button type="button" onClick={() => handlePagarAgora()} className="h-11 rounded-xl bg-[#14B8A6] text-sm font-semibold text-white">Pagar mensalidade</button>
              <button type="button" onClick={() => handlePagarAgora(currentMonth.mes, currentMonth.ano, "receipt")} className="h-11 rounded-xl border border-[#14B8A6] text-sm font-semibold text-[#0F766E]">Enviar comprovante</button>
              <button type="button" onClick={handleOpenWhatsApp} className="h-11 rounded-xl border border-gray-300 text-sm font-semibold text-[#374151]">Falar com suporte</button>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-bold text-[#111827]">Duvidas frequentes</h2>
            <div className="space-y-2 text-sm text-[#374151]">
              <p className="rounded-xl bg-[#F9FAFB] px-3 py-2">Como pagar via PIX? Abra a aba Pagamentos e use QR Code ou copia e cola.</p>
              <p className="rounded-xl bg-[#F9FAFB] px-3 py-2">Comprovante rejeitado? Envie novamente na tela de pagamento.</p>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-[#14B8A6]" />
              <h2 className="text-sm font-bold text-[#111827]">Dados da conta</h2>
            </div>
            <div className="space-y-1 text-sm text-[#374151]">
              <p><span className="font-semibold">Nome:</span> {passenger.nome}</p>
              <p><span className="font-semibold">Rota:</span> {passenger.rota}</p>
              <p><span className="font-semibold">Telefone:</span> {passenger.telefone}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#14B8A6]" />
              <h2 className="text-sm font-bold text-[#111827]">Politicas e regras</h2>
            </div>
            <ul className="list-disc space-y-1 pl-4 text-sm text-[#374151]">
              <li>Vencimento padrao no dia {passenger.diaVencimento} de cada mes.</li>
              <li>Pagamento identificado apos confirmacao no sistema.</li>
              <li>Atendimento oficial somente pelo WhatsApp da van.</li>
            </ul>
          </section>
        </div>
      ) : null}

      {activeTab === "pagamentos" ? (
        <div className="px-4 pt-4">
          {shouldShowAlert ? (
            <div className={`rounded-xl border px-4 py-3 ${status === "atrasado" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
              <p className="text-center text-sm font-medium">
                {status === "atrasado"
                  ? `Pagamento em atraso - R$ ${formatarValor(monthRow.payment.valor)}`
                  : `Vence em ${diasParaVencer} ${diasParaVencer === 1 ? "dia" : "dias"} - R$ ${formatarValor(monthRow.payment.valor)}`}
              </p>
            </div>
          ) : null}

          <div className={`mt-4 rounded-2xl border-2 p-5 ${badgeByStatus[status].cardClass}`}>
            <div className="mb-4 flex items-center justify-between">
              <span className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ${badgeByStatus[status].badgeClass}`}>{badgeByStatus[status].label}</span>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-[#6B7280]">{formatMonthYearTitle(currentMonth.mes, currentMonth.ano)}</span>
                {status === "pago" ? (
                  <button
                    type="button"
                    disabled
                    className="h-8 rounded-full bg-green-100 px-3 text-xs font-semibold text-green-700"
                  >
                    Pagamento confirmado
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePagarAgora()}
                    className={`h-8 rounded-full px-3 text-xs font-semibold text-white ${
                      status === "atrasado" ? "bg-red-600" : "bg-[#14B8A6]"
                    }`}
                  >
                    {status === "atrasado" ? "Regularizar situacao" : "Realizar pagamento"}
                  </button>
                )}
              </div>
            </div>

            <p className="mb-1 text-3xl font-bold text-[#111827]">R$ {formatarValor(monthRow.payment.valor)}</p>
            <p className="mb-3 text-sm text-[#6B7280]">Vencimento: {dataVencimento}</p>

            {status === "pago" && monthRow.payment.dataPagamento ? (
              <p className="text-sm font-medium text-green-700">✓ Pago em {monthRow.payment.dataPagamento.split("-").reverse().join("/")}</p>
            ) : null}
          </div>

          {status === "pago" ? (
            <div className="mt-4 flex items-center justify-center gap-2 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">✓</div>
              <p className="text-sm font-medium text-green-700">Pagamento confirmado</p>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              <button type="button" onClick={() => handlePagarAgora()} className="h-12 w-full rounded-2xl bg-[#14B8A6] text-base font-bold text-white shadow-sm">Pagar agora</button>
            </div>
          )}

          <div className="mt-6">
            <h2 className="mb-3 text-base font-bold text-[#111827]">Historico de pagamentos</h2>
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {historico.map((item, index) => {
                const statusConfig = {
                  pago: { icon: "✓", text: "text-green-600", bg: "bg-green-100" },
                  atrasado: { icon: "⚠", text: "text-red-600", bg: "bg-red-100" },
                  pendente: { icon: "⏳", text: "text-amber-600", bg: "bg-amber-100" },
                } as const;

                const sc = statusConfig[item.status];

                return (
                  <button
                    key={`${item.mes}-${index}`}
                    type="button"
                    onClick={() => setSelectedHistory(item)}
                    className={`flex w-full items-center justify-between px-4 py-3.5 text-left ${index < historico.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${sc.bg}`}>
                        <span className={sc.text}>{sc.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{item.mes}</p>
                        {item.dataPagamento ? <p className="text-xs text-[#9CA3AF]">Pago em {item.dataPagamento.split("-").reverse().join("/")}</p> : null}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#111827]">R$ {formatarValor(item.valor)}</p>
                      <p className={`text-xs ${sc.text}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</p>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#6B7280]">Ver detalhes <ChevronRight className="h-3 w-3" /></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "suporte" ? (
        <div className="px-4 pt-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-bold text-[#111827]">Atendimento</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Precisa de ajuda com pagamento, comprovante ou cadastro? Fale com a equipe.</p>
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-base font-semibold text-white shadow-sm"
            >
              <MessageCircle className="h-5 w-5" />
              Falar com Suporte
            </button>
          </div>
        </div>
      ) : null}

      {selectedHistory ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 px-4 pb-[calc(76px+env(safe-area-inset-bottom))]">
          <div className="max-h-[85vh] w-full max-w-[430px] overflow-y-auto rounded-t-2xl bg-white p-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-base font-bold text-[#111827]">{selectedHistory.mes}</p>
                <p className="text-sm text-[#6B7280]">Status da mensalidade</p>
              </div>
              <button type="button" onClick={() => setSelectedHistory(null)} aria-label="Fechar detalhes do pagamento" className="rounded-full p-1 text-[#6B7280]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-[#F9FAFB] p-4">
              <p className="text-sm text-[#6B7280]">Valor</p>
              <p className="text-xl font-bold text-[#111827]">R$ {formatarValor(selectedHistory.valor)}</p>
              <p className="mt-2 text-sm text-[#6B7280]">Status: <span className="font-semibold text-[#111827]">{selectedHistory.status}</span></p>
              {selectedHistory.dataPagamento ? <p className="mt-1 text-sm text-green-700">Pago em {selectedHistory.dataPagamento.split("-").reverse().join("/")}</p> : null}
            </div>

            {selectedHistory.status === "atrasado" || selectedHistory.status === "pendente" ? (
              <button type="button" onClick={handlePayHistoryMonth} className="mt-4 h-12 w-full rounded-2xl bg-[#14B8A6] text-base font-bold text-white">Realizar pagamento</button>
            ) : null}
          </div>
        </div>
      ) : null}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-2 pb-safe">
        <div className="mx-auto flex max-w-[430px] items-center justify-around">
          <button type="button" onClick={() => setActiveTab("inicio")} className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1 ${activeTab === "inicio" ? "text-[#14B8A6]" : "text-gray-400"}`}>
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Inicio</span>
          </button>

          <button type="button" onClick={() => setActiveTab("pagamentos")} className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1 ${activeTab === "pagamentos" ? "text-[#14B8A6]" : "text-gray-400"}`}>
            <CreditCard className="h-5 w-5" />
            <span className="text-xs font-medium">Pagamentos</span>
          </button>

          <button type="button" onClick={() => setActiveTab("suporte")} className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1 ${activeTab === "suporte" ? "text-[#14B8A6]" : "text-gray-400"}`}>
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs font-medium">Suporte</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
