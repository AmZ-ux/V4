import { ArrowLeft, Copy, QrCode, Paperclip } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuthStore } from "@/store/useAuthStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import { createPixPayload } from "@/utils/pix";

const PIX_KEY = "pix@minhavan.com";

type ReceiptStatus = "pendente" | "em_analise" | "aprovado" | "rejeitado";

export function PassengerPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const user = useAuthStore((state) => state.user);
  const passengers = usePaymentStore((state) => state.passengers);
  const monthPayments = usePaymentStore((state) => state.monthPayments);
  const currentMonth = usePaymentStore((state) => state.currentMonth);

  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [receiptStatus, setReceiptStatus] = useState<ReceiptStatus>("pendente");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const passenger = passengers.find((item) => item.id === user?.passengerId) ?? null;
  const month = Number(searchParams.get("month") ?? currentMonth.mes);
  const year = Number(searchParams.get("year") ?? currentMonth.ano);
  const action = searchParams.get("action");

  const row = useMemo(() => {
    if (!passenger) return null;
    return monthPayments(month, year).find((item) => item.passenger.id === passenger.id) ?? null;
  }, [passenger, monthPayments, month, year]);

  const amount = row?.payment.valor ?? 0;
  const payload = useMemo(() => {
    if (!passenger || !row) return "";
    return createPixPayload({
      key: PIX_KEY,
      amount,
      merchantName: "Minha Van",
      merchantCity: "Teresina",
      txid: `${passenger.id}-${year}${String(month).padStart(2, "0")}`,
    });
  }, [passenger, row, amount, year, month]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(payload)}`;

  async function copyPayload() {
    if (!payload) return;
    await navigator.clipboard.writeText(payload);
    setCopiedPayload(true);
    window.setTimeout(() => setCopiedPayload(false), 2200);
  }

  async function copyKey() {
    await navigator.clipboard.writeText(PIX_KEY);
    setCopiedKey(true);
    window.setTimeout(() => setCopiedKey(false), 2200);
  }

  function openFileSelector() {
    fileInputRef.current?.click();
  }

  if (!passenger || !row) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-4 text-center text-sm text-[#6B7280]">
        Nao foi possivel carregar os dados de pagamento.
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#F9FAFB] px-4 pb-8 pt-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex h-10 items-center gap-2 rounded-full bg-white px-3 text-sm font-semibold text-[#374151] shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold text-[#111827]">Pagamento via PIX</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          {new Date(year, month - 1, 1).toLocaleString("pt-BR", { month: "long", year: "numeric" })}
        </p>
        <p className="mt-2 text-3xl font-bold text-[#111827]">
          R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-[#374151]">QR Code PIX</p>
        <div className="flex justify-center">
          {payload ? (
            <img src={qrUrl} alt="QR Code para pagamento PIX" className="h-[280px] w-[280px] rounded-xl border border-gray-100" />
          ) : (
            <div className="flex h-[280px] w-[280px] items-center justify-center rounded-xl border border-gray-100 bg-[#F3F4F6]">
              <QrCode className="h-10 w-10 text-[#9CA3AF]" />
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-[#9CA3AF]">Se o QR nao carregar, use o codigo copia e cola abaixo.</p>
      </div>

      <div className={`mt-4 rounded-2xl border p-4 shadow-sm ${action === "receipt" ? "border-[#14B8A6] bg-[#ECFEFF]" : "border-gray-200 bg-white"}`}>
        <p className="text-sm font-semibold text-[#374151]">Enviar comprovante</p>
        {receiptStatus === "em_analise" ? (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">Comprovante em analise.</p>
        ) : null}
        {receiptStatus === "rejeitado" ? (
          <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">Comprovante rejeitado. Reenvie.</p>
        ) : null}
        <button
          type="button"
          onClick={openFileSelector}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#D1D5DB] px-4 text-sm font-semibold text-[#374151]"
        >
          <Paperclip className="h-4 w-4" />
          {receiptStatus === "rejeitado" ? "Reenviar comprovante" : "Enviar comprovante"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={() => setReceiptStatus("em_analise")} />
      </div>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-[#374151]">Copia e cola PIX</p>
        <textarea
          readOnly
          value={payload}
          className="mt-2 min-h-[96px] w-full resize-none rounded-xl border border-gray-200 bg-[#F9FAFB] p-3 text-xs text-[#374151] outline-none"
        />

        <button
          type="button"
          onClick={copyPayload}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#14B8A6] px-4 text-sm font-semibold text-white"
        >
          <Copy className="h-4 w-4" />
          {copiedPayload ? "Codigo PIX copiado!" : "Copiar codigo PIX"}
        </button>

        <button
          type="button"
          onClick={copyKey}
          className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#14B8A6] px-4 text-sm font-semibold text-[#0F766E]"
        >
          <Copy className="h-4 w-4" />
          {copiedKey ? "Chave PIX copiada!" : "Copiar chave PIX"}
        </button>
      </div>
    </div>
  );
}
