import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ScreenHeaderGreen } from "@/components/common/ScreenHeaderGreen";
import { Toast } from "@/components/common/Toast";
import { apiGetSettings, apiUpdateSettings } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 px-screen text-[12px] font-bold uppercase tracking-[0.08em] text-ink-400">{title}</h2>
      <div className="mx-screen divide-y divide-ink-100 overflow-hidden rounded-card bg-white shadow-card">{children}</div>
    </section>
  );
}

function SettingRow({ label, description, children }: { label: string; description: string; children: ReactNode }) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-ink-900">{label}</p>
          <p className="mt-0.5 text-[12px] text-ink-500">{description}</p>
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-6 w-12 rounded-full transition-colors ${value ? "bg-brand-700" : "bg-ink-300"}`}
      aria-label={value ? "Desativar opcao" : "Ativar opcao"}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-0.5"}`}
      />
    </button>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [toast, setToast] = useState<string | null>(null);

  const [pixKey, setPixKey] = useState("");
  const [diaVencimento, setDiaVencimento] = useState("");

  const [defaultMessage, setDefaultMessage] = useState("");
  const [mensagemAtraso, setMensagemAtraso] = useState("");
  const [mensagemConfirmacao, setMensagemConfirmacao] = useState("");
  const [envioAutomatico, setEnvioAutomatico] = useState(false);
  const [diasLembrete, setDiasLembrete] = useState("");

  const [autenticacaoAtiva, setAutenticacaoAtiva] = useState(false);

  useEffect(() => {
    apiGetSettings()
      .then((settings) => {
        setPixKey(settings.pixKey);
        setDiaVencimento(String(settings.dueDayDefault));
        setDefaultMessage(settings.defaultMessage);
        setMensagemAtraso(settings.lateMessage);
        setMensagemConfirmacao(settings.confirmationMessage);
        setEnvioAutomatico(settings.autoSend);
        setDiasLembrete(String(settings.reminderDays));
      })
      .catch(() => {
        // fallback to local defaults
      });
  }, []);

  const handleSave = async () => {
    try {
      await apiUpdateSettings({
        pixKey: pixKey || "pix@minhavan.com",
        dueDayDefault: Number(diaVencimento) || 10,
        defaultMessage: defaultMessage || "Ola! Lembrete da mensalidade.",
        lateMessage: mensagemAtraso || "Sua mensalidade esta em atraso. Pode confirmar o pagamento?",
        confirmationMessage: mensagemConfirmacao || "Pagamento confirmado. Obrigado!",
        autoSend: envioAutomatico,
        reminderDays: Number(diasLembrete) || 3,
      });
      setToast("Configuracoes salvas.");
    } catch {
      setToast("Falha ao salvar configuracoes.");
    }
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="pb-24">
      {toast ? <Toast message={toast} /> : null}
      <ScreenHeaderGreen className="px-screen pb-5 pt-12">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white"
          aria-label="Voltar para inicio"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-h1 font-extrabold text-white">Configuracoes</h1>
        <p className="text-[13px] text-white/85">Preferencias e dados da van</p>
      </ScreenHeaderGreen>

      <div className="pt-4">
        <Section title="PAGAMENTOS">
          <SettingRow label="Chave PIX" description="Para mensagens de cobranca">
            <input
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, e-mail ou telefone"
              className="w-40 rounded-pill border border-ink-200 px-3 py-1 text-right text-[12px] text-ink-700 outline-none"
            />
          </SettingRow>
          <SettingRow label="Dia de vencimento" description="Dia do mes para cobrancas">
            <input
              value={diaVencimento}
              onChange={(e) => setDiaVencimento(e.target.value)}
              placeholder="5"
              type="number"
              min={1}
              max={31}
              className="w-20 rounded-pill border border-ink-200 px-3 py-1 text-right text-[12px] text-ink-700 outline-none"
            />
          </SettingRow>
        </Section>

        <Section title="NOTIFICACOES">
          <SettingRow label="Mensagem padrao" description="Texto enviado no WhatsApp">
            <input
              value={defaultMessage}
              onChange={(e) => setDefaultMessage(e.target.value)}
              placeholder="Editar mensagem"
              className="w-40 rounded-pill border border-ink-200 px-3 py-1 text-right text-[12px] text-ink-700 outline-none"
            />
          </SettingRow>
          <SettingRow label="Mensagem de atraso" description="Para passageiros em atraso">
            <input
              value={mensagemAtraso}
              onChange={(e) => setMensagemAtraso(e.target.value)}
              placeholder="Editar mensagem"
              className="w-40 rounded-pill border border-ink-200 px-3 py-1 text-right text-[12px] text-ink-700 outline-none"
            />
          </SettingRow>
          <SettingRow label="Confirmacao de pagamento" description="Mensagem pos-pagamento">
            <input
              value={mensagemConfirmacao}
              onChange={(e) => setMensagemConfirmacao(e.target.value)}
              placeholder="Editar mensagem"
              className="w-40 rounded-pill border border-ink-200 px-3 py-1 text-right text-[12px] text-ink-700 outline-none"
            />
          </SettingRow>
          <SettingRow label="Envio automatico" description="Notificar automaticamente">
            <Toggle value={envioAutomatico} onChange={setEnvioAutomatico} />
          </SettingRow>
          <SettingRow label="Dias antes do vencimento" description="Lembrete antecipado">
            <input
              value={diasLembrete}
              onChange={(e) => setDiasLembrete(e.target.value)}
              placeholder="3"
              type="number"
              className="w-16 rounded-pill border border-ink-200 px-3 py-1 text-right text-[12px] text-ink-700 outline-none"
            />
          </SettingRow>
        </Section>

        <Section title="SEGURANCA">
          <SettingRow label="Alterar senha" description="Redefinir senha de acesso">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-pill border border-brand-200 px-3 py-1 text-[12px] font-semibold text-brand-700"
            >
              Alterar
            </button>
          </SettingRow>
          <SettingRow label="Autenticacao" description="Exigir senha ao abrir o app">
            <Toggle value={autenticacaoAtiva} onChange={setAutenticacaoAtiva} />
          </SettingRow>
          <SettingRow label="Sessoes ativas" description="Dispositivos com acesso">
            <button type="button" className="rounded-pill border border-brand-200 px-3 py-1 text-[12px] font-semibold text-brand-700">
              Ver
            </button>
          </SettingRow>
        </Section>

        <div className="px-screen pb-8">
          <button
            type="button"
            onClick={handleSave}
            className="h-12 w-full rounded-card bg-brand-700 text-[15px] font-semibold text-white"
          >
            Salvar configuracoes
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="mt-3 h-12 w-full rounded-card border border-ink-200 bg-white text-[15px] font-semibold text-ink-700"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
