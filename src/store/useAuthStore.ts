import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "passenger";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  passengerId?: string;
}

interface Account {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  passengerId?: string;
}

const ADMIN_EMAILS = ["admin@minhavan.com", "motorista@minhavan.com"];

const ACCOUNTS: Account[] = [
  { id: "u-admin", email: "admin@minhavan.com", password: "123456", role: "admin" },
  { id: "u-p01", email: "ana@ifpi.com", password: "123456", role: "passenger", passengerId: "p01" },
  { id: "u-p02", email: "bruno@ifpi.com", password: "123456", role: "passenger", passengerId: "p02" },
  { id: "u-p05", email: "mariana@ifpi.com", password: "123456", role: "passenger", passengerId: "p05" },
  { id: "u-p07", email: "gabriela@uespi.com", password: "123456", role: "passenger", passengerId: "p07" },
  { id: "u-p12", email: "daniel@ufpi.com", password: "123456", role: "passenger", passengerId: "p12" },
  { id: "u-p18", email: "carlos@contratos.com", password: "123456", role: "passenger", passengerId: "p18" },
];

function detectRoleFromEmail(email: string): UserRole {
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "passenger";
}

interface AuthStore {
  user: SessionUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  logout: () => void;
  setReady: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      ready: false,
      setReady: (value) => set({ ready: value }),
      login: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const account = ACCOUNTS.find((item) => item.email === normalizedEmail);

        if (!account || account.password !== password) {
          throw new Error("INVALID_CREDENTIALS");
        }

        const role = account.role ?? detectRoleFromEmail(normalizedEmail);
        const sessionUser: SessionUser = {
          id: account.id,
          email: account.email,
          role,
          passengerId: account.passengerId,
        };

        set({ user: sessionUser });
        return sessionUser;
      },
      logout: () => set({ user: null }),
    }),
    {
      name: "van-auth-v1",
      onRehydrateStorage: () => (state) => {
        state?.setReady(true);
      },
    },
  ),
);
