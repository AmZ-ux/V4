import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/useAuthStore";

export function GreetingHeader() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="bg-[linear-gradient(135deg,#0A4B2F_0%,#127A4B_100%)] px-5 pb-14 pt-12">
      <div className="flex items-start justify-between">
        <h1 className="text-h1 font-extrabold leading-tight text-white">Painel Administrador</h1>

        <div className="flex items-center gap-2">
          <button
            aria-label="Configuracoes"
            type="button"
            onClick={() => navigate("/configuracoes")}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15"
          >
            <Settings className="h-[22px] w-[22px] text-white" />
          </button>

          <button
            aria-label="Sair"
            type="button"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15"
          >
            <LogOut className="h-[20px] w-[20px] text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
