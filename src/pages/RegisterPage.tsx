import { ArrowLeft, Bus } from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import InputMask from "react-input-mask";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/useAuthStore";
import type { Route } from "@/types";

const routes: Route[] = ["IFPI", "UESPI", "UFPI", "R.SÁ", "CONTRATOS"];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-ink-700">{label}</span>
        {hint ? <span className="text-[11px] text-ink-400">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-[15px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20";

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [rota, setRota] = useState<Route>("IFPI");
  const [mensalidade, setMensalidade] = useState("280");
  const [diaVencimento, setDiaVencimento] = useState("10");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    if (nome.trim().length < 3) return false;
    if (!email.includes("@")) return false;
    if (telefone.length !== 15) return false;
    if (Number(mensalidade) <= 0) return false;
    if (Number(diaVencimento) < 1 || Number(diaVencimento) > 28) return false;
    if (password.length < 6) return false;
    if (confirmPassword !== password) return false;
    return true;
  }, [nome, email, telefone, mensalidade, diaVencimento, password, confirmPassword]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      await register({
        nome: nome.trim(),
        email,
        telefone,
        rota,
        mensalidade: Number(mensalidade),
        diaVencimento: Number(diaVencimento),
        password,
      });

      navigate("/login?cadastro=sucesso", { replace: true });
    } catch (err) {
      const code = err instanceof Error ? err.message : "UNKNOWN_ERROR";
      setError(code === "EMAIL_ALREADY_EXISTS" ? "Este e-mail ja esta cadastrado." : "Nao foi possivel concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-brand-50">
      <div className="mx-auto w-full max-w-[560px] px-safe pb-[calc(env(safe-area-inset-bottom)+82px)] pt-[env(safe-area-inset-top)]">
        <div className="mb-5 rounded-card bg-white p-4 pt-10 shadow-card">
          <div className="mb-5 mt-8">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 rounded-pill bg-ink-100 px-4 py-2 text-[18px] font-semibold text-ink-700 shadow-card"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white">
              <Bus className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-h1 font-extrabold leading-tight text-ink-900">Cadastro de Passageiro</h1>
              <p className="text-body text-ink-500">Crie sua conta para acessar o portal</p>
            </div>
          </div>
        </div>

        <form id="register-form" onSubmit={handleSubmit} className="space-y-4 rounded-card border border-ink-200 bg-white p-4 shadow-card">
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-400">Dados pessoais</p>

          <Field label="Nome completo">
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex: Joao Batista"
              className={inputClassName}
            />
          </Field>

          <Field label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              className={inputClassName}
            />
          </Field>

          <Field label="Telefone">
            <InputMask
              mask="(99) 99999-9999"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              placeholder="(00) 00000-0000"
              className={inputClassName}
            />
          </Field>

          <p className="pt-1 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-400">Dados do transporte</p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field label="Instituicao">
              <select value={rota} onChange={(event) => setRota(event.target.value as Route)} className={inputClassName}>
                {routes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>

            <Field label="Vencimento" hint="Dia 1 a 28">
              <input
                type="number"
                min={1}
                max={28}
                value={diaVencimento}
                onChange={(event) => setDiaVencimento(event.target.value)}
                placeholder="10"
                className={inputClassName}
              />
            </Field>
          </div>

          <Field label="Mensalidade (R$)">
            <input
              type="number"
              min={0}
              value={mensalidade}
              onChange={(event) => setMensalidade(event.target.value)}
              placeholder="280"
              className={inputClassName}
            />
          </Field>

          <p className="pt-1 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-400">Dados de acesso</p>

          <Field label="Senha" hint="Minimo 6 caracteres">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              className={inputClassName}
            />
          </Field>

          <Field label="Confirmar senha">
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repita a senha"
              className={inputClassName}
            />
          </Field>

          {error ? <div className="rounded-xl border border-danger-100 bg-danger-50 px-3 py-2 text-sm text-danger-700">{error}</div> : null}
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto w-full max-w-[560px] bg-gradient-to-t from-brand-50 via-brand-50/95 to-transparent px-safe pb-[calc(env(safe-area-inset-bottom)+6px)] pt-0.5">
          <button
            type="submit"
            form="register-form"
            disabled={!canSubmit || loading}
            className="h-12 w-full rounded-xl bg-brand-700 text-base font-bold text-white shadow-card-hi disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Criar conta"}
          </button>
        </div>
      </div>
    </div>
  );
}
