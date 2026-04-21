const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "van-auth-token";

export interface ApiSessionUser {
  id: string;
  email: string;
  role: "admin" | "passenger";
  passengerId?: string;
}

export interface ApiPassenger {
  id: string;
  nome: string;
  telefone: string;
  rota: "IFPI" | "UESPI" | "UFPI" | "R.SÁ" | "CONTRATOS";
  mensalidade: number;
  diaVencimento: number;
}

export interface ApiPayment {
  id: string;
  passengerId: string;
  mes: number;
  ano: number;
  valor: number;
  dataPagamento: string | null;
  receiptStatus?: "none" | "in_review" | "approved" | "rejected";
  receiptFile?: string | null;
  receiptUploadedAt?: string | null;
}

interface ApiBootstrap {
  currentMonth: { mes: number; ano: number };
  passengers: ApiPassenger[];
  payments: ApiPayment[];
  settings: {
    pixKey: string;
    dueDayDefault: number;
    defaultMessage: string;
    lateMessage: string;
    confirmationMessage: string;
    autoSend: boolean;
    reminderDays: number;
  };
}

function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let payload: { message?: string } | null = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    throw new Error(payload?.message ?? "API_ERROR");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiLogin(email: string, password: string) {
  return request<{ token: string; user: ApiSessionUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(payload: {
  nome: string;
  email: string;
  telefone: string;
  rota: ApiPassenger["rota"];
  mensalidade: number;
  diaVencimento: number;
  password: string;
}) {
  return request<{ passenger: ApiPassenger }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiBootstrap() {
  return request<ApiBootstrap>("/bootstrap");
}

export async function apiCreatePassenger(payload: Omit<ApiPassenger, "id">) {
  return request<ApiPassenger>("/passengers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiDeletePassenger(passengerId: string) {
  return request<void>(`/passengers/${passengerId}`, { method: "DELETE" });
}

export async function apiMarkAsPaid(passengerId: string, month: number, year: number) {
  return request<ApiPayment>("/payments/mark-paid", {
    method: "POST",
    body: JSON.stringify({ passengerId, month, year }),
  });
}

export async function apiRestoreDate(passengerId: string, month: number, year: number, previousDate: string | null) {
  return request<ApiPayment>("/payments/restore-date", {
    method: "POST",
    body: JSON.stringify({ passengerId, month, year, previousDate }),
  });
}

export async function apiLookupByPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return request<{ passenger: ApiPassenger; history: ApiPayment[] }>(`/portal/lookup?phone=${digits}`);
}

export async function apiGetSettings() {
  return request<ApiBootstrap["settings"]>("/settings");
}

export async function apiUpdateSettings(payload: ApiBootstrap["settings"]) {
  return request<ApiBootstrap["settings"]>("/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function apiUploadReceipt(file: File, month: number, year: number) {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("month", String(month));
  formData.set("year", String(year));
  return request<ApiPayment>("/passenger/receipt", {
    method: "POST",
    body: formData,
  });
}

export async function apiListPendingReceipts() {
  return request<
    Array<ApiPayment & { passengerNome: string; passengerTelefone: string }>
  >("/receipts/pending");
}

export async function apiSetReceiptStatus(paymentId: string, status: "approved" | "rejected" | "in_review") {
  return request<ApiPayment>(`/receipts/${paymentId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
