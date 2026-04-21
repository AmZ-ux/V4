import { useState } from "react";
import { BarChart3, Bell, Clock } from "lucide-react";

import { SectionEyebrow } from "@/components/common/SectionEyebrow";
import { Toast } from "@/components/common/Toast";
import { AdminActionCard } from "@/components/home/AdminActionCard";
import { GreetingHeader } from "@/components/home/GreetingHeader";
import { MonthSummaryCard } from "@/components/home/MonthSummaryCard";
import { RouteSummaryGrid } from "@/components/home/RouteSummaryGrid";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { downloadMonthlyReportCsv, downloadMonthlyReportPdf } from "@/services/report";
import { openWhatsApp } from "@/services/whatsapp";
import { usePaymentStore } from "@/store/usePaymentStore";
import { formatBRL, formatMonthYearTitle } from "@/utils/currency";

export function HomePage() {
  const stats = useDashboardStats();
  const month = usePaymentStore((state) => state.currentMonth);
  const monthPayments = usePaymentStore((state) => state.monthPayments);
  const [toast, setToast] = useState<string | null>(null);
  const [showReportPicker, setShowReportPicker] = useState(false);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const notifyOverdue = () => {
    const overdueRows = monthPayments(month.mes, month.ano).filter((row) => row.status === "atrasado");
    if (overdueRows.length === 0) {
      showToast("Nenhum passageiro em atraso.");
      return;
    }

    overdueRows.forEach((row, index) => {
      window.setTimeout(() => {
        openWhatsApp(
          row.passenger.telefone,
          `Oi ${row.passenger.nome}! Sua mensalidade de ${formatMonthYearTitle(month.mes, month.ano)} (${formatBRL(row.payment.valor)}) esta em atraso. Pode confirmar o pagamento?`,
        );
      }, index * 800);
    });

    showToast(`Abrindo WhatsApp para ${overdueRows.length} atrasado(s).`);
  };

  const remindPending = () => {
    const message = stats.pendingCount > 0 ? `Lembrete enviado para ${stats.pendingCount} pendente(s).` : "Nenhum pagamento pendente.";
    showToast(message);
  };

  const reportPayload = {
    month: month.mes,
    year: month.ano,
    rows: monthPayments(month.mes, month.ano).map((row) => ({
      nome: row.passenger.nome,
      rota: row.passenger.rota,
      valor: row.payment.valor,
      status: row.status,
    })),
    received: stats.totalReceivedInMonth,
    expected: stats.totalExpectedInMonth,
  };

  const exportReportCsv = () => {
    downloadMonthlyReportCsv(reportPayload);
    showToast("Relatorio CSV exportado.");
    setShowReportPicker(false);
  };

  const exportReportPdf = () => {
    downloadMonthlyReportPdf(reportPayload);
    showToast("Relatorio PDF exportado.");
    setShowReportPicker(false);
  };

  return (
    <div className="pb-28">
      {toast ? <Toast message={toast} /> : null}
      <GreetingHeader />

      <MonthSummaryCard
        month={month.mes}
        year={month.ano}
        received={stats.totalReceivedInMonth}
        expected={stats.totalExpectedInMonth}
        paid={stats.paidCount}
        pending={stats.pendingCount}
        overdue={stats.overdueCount}
        total={stats.totalCount}
      />

      <div className="px-screen">
        <section id="acoes">
          <SectionEyebrow>ACOES DO ADMINISTRADOR</SectionEyebrow>

          <AdminActionCard
            variant="danger"
            icon={Bell}
            title="Notificar atrasados"
            subtitle={`Enviar cobranca para ${stats.overdueCount} passageiro(s)`}
            onClick={notifyOverdue}
          />

          <AdminActionCard
            variant="warning"
            icon={Clock}
            title="Lembrar pendentes"
            subtitle={stats.pendingCount > 0 ? `Enviar lembrete para ${stats.pendingCount} passageiro(s)` : "Nenhum pagamento pendente"}
            onClick={remindPending}
          />

          <AdminActionCard
            variant="success"
            icon={BarChart3}
            title="Gerar relatorio mensal"
            subtitle={`Resumo de ${formatMonthYearTitle(month.mes, month.ano)}`}
            onClick={() => setShowReportPicker(true)}
          />
        </section>

        <section id="rotas">
          <SectionEyebrow>RESUMO POR ROTA</SectionEyebrow>
          <RouteSummaryGrid rows={stats.routeSummary} />
        </section>
      </div>

      {showReportPicker ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-4 pb-0">
          <div className="w-full max-w-[480px] rounded-t-[24px] bg-white p-5 pb-8">
            <h2 className="text-center text-h2 font-bold text-ink-900">Escolha o formato do relatorio</h2>
            <p className="mt-1 text-center text-[13px] text-ink-500">Selecione como deseja exportar os dados do mes</p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={exportReportCsv}
                className="h-12 rounded-xl border-2 border-brand-700 text-[15px] font-semibold text-brand-700"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={exportReportPdf}
                className="h-12 rounded-xl bg-brand-700 text-[15px] font-semibold text-white"
              >
                PDF
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowReportPicker(false)}
              className="mt-3 h-11 w-full rounded-pill border border-ink-200 text-[14px] font-semibold text-ink-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
