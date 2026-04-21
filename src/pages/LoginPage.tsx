import { Eye, EyeOff, Mail, Bus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/useAuthStore";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    navigate(user.role === "admin" ? "/dashboard-admin" : "/passageiro", { replace: true });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await login(email, password);
      navigate(session.role === "admin" ? "/dashboard-admin" : "/passageiro", { replace: true });
    } catch {
      setError("E-mail ou senha incorretos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-6">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#14B8A6] text-white">
        <Bus className="h-10 w-10" />
      </div>

      <h1 className="mb-1 text-2xl font-bold text-[#111827]">Gestao de Van Escolar</h1>
      <p className="mb-8 text-sm text-[#6B7280]">Login unico com deteccao automatica de papel</p>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#374151]">E-mail</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="seu@email.com"
              className="h-12 w-full rounded-xl border border-[#D1D5DB] bg-white pl-11 pr-4 text-[16px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#374151]">Senha</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 pr-12 text-[16px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </label>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-center text-sm text-red-600">{error}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 rounded-xl bg-[#14B8A6] text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button type="button" className="text-sm text-[#0F766E]">
          Esqueci minha senha
        </button>

        <div className="rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-xs text-[#6B7280]">
          <p>Demo admin: admin@minhavan.com / 123456</p>
          <p>Demo passageiro: ana@ifpi.com / 123456</p>
        </div>
      </form>
    </div>
  );
}


