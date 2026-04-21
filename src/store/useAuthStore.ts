import { create } from "zustand";
import { persist } from "zustand/middleware";

import { apiLogin, apiRegister, setAuthToken } from "@/services/api";
import type { Route } from "@/types";

export type UserRole = "admin" | "passenger";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  passengerId?: string;
}

interface AuthStore {
  user: SessionUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  register: (payload: {
    nome: string;
    email: string;
    telefone: string;
    rota: Route;
    mensalidade: number;
    diaVencimento: number;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  setReady: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      ready: false,
      setReady: (value) => set({ ready: value }),
      login: async (email, password) => {
        const { token, user } = await apiLogin(email.trim().toLowerCase(), password);
        setAuthToken(token);
        const sessionUser: SessionUser = {
          id: user.id,
          email: user.email,
          role: user.role,
          passengerId: user.passengerId,
        };
        set({ token, user: sessionUser });
        return sessionUser;
      },
      register: async (payload) => {
        await apiRegister({
          ...payload,
          email: payload.email.trim().toLowerCase(),
        });
      },
      logout: () => {
        setAuthToken(null);
        set({ user: null, token: null });
      },
    }),
    {
      name: "van-auth-v2",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        setAuthToken(state?.token ?? null);
        state?.setReady(true);
      },
    },
  ),
);

