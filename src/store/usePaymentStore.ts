import { create } from "zustand";

import {
  apiBootstrap,
  apiCreatePassenger,
  apiDeletePassenger,
  apiLookupByPhone,
  apiMarkAsPaid,
  apiRestoreDate,
} from "@/services/api";
import type { CurrentMonth, Passenger, Payment, PaymentStatus, Route } from "@/types";
import { digitsOnly } from "@/utils/phone";
import { todayIsoDate } from "@/utils/date";

const ROUTE_ORDER: Route[] = ["IFPI", "UESPI", "UFPI", "R.SÁ", "CONTRATOS"];

export function getPaymentStatus(payment: Payment, passenger: Passenger, today = new Date()): PaymentStatus {
  if (payment.dataPagamento) return "pago";
  const dueDate = new Date(payment.ano, payment.mes - 1, passenger.diaVencimento, 23, 59, 59);
  return today > dueDate ? "atrasado" : "pendente";
}

function comparePassengers(a: Passenger, b: Passenger): number {
  const routeDiff = ROUTE_ORDER.indexOf(a.rota) - ROUTE_ORDER.indexOf(b.rota);
  if (routeDiff !== 0) return routeDiff;
  const dueDiff = a.diaVencimento - b.diaVencimento;
  if (dueDiff !== 0) return dueDiff;
  return a.nome.localeCompare(b.nome, "pt-BR");
}

export interface PaymentWithPassenger {
  passenger: Passenger;
  payment: Payment;
  status: PaymentStatus;
}

export interface PassengerMonthHistory {
  month: number;
  year: number;
  payment: Payment;
  status: PaymentStatus;
}

interface PaymentStore {
  currentMonth: CurrentMonth;
  passengers: Passenger[];
  payments: Payment[];
  hydrated: boolean;
  hydrateFromServer: () => Promise<void>;
  clear: () => void;
  monthPayments: (month?: number, year?: number) => PaymentWithPassenger[];
  totalExpectedInMonth: (month?: number, year?: number) => number;
  totalReceivedInMonth: (month?: number, year?: number) => number;
  paidCountInMonth: (month?: number, year?: number) => number;
  pendingCountInMonth: (month?: number, year?: number) => number;
  overdueCountInMonth: (month?: number, year?: number) => number;
  routeSummary: (month?: number, year?: number) => Array<{ rota: Route; paid: number; total: number }>;
  markAsPaid: (passengerId: string, month: number, year?: number) => void;
  restorePaymentDate: (passengerId: string, month: number, previousDate: string | null, year?: number) => void;
  addPassenger: (payload: Omit<Passenger, "id">) => Promise<Passenger>;
  deletePassenger: (passengerId: string) => Promise<void>;
  findByPhone: (phone: string) => Promise<{
    passenger: Passenger;
    history: PassengerMonthHistory[];
  } | null>;
}

function resolveMonthYear(month: number | undefined, year: number | undefined, current: CurrentMonth) {
  return {
    month: month ?? current.mes,
    year: year ?? current.ano,
  };
}

function paymentIdFor(passengerId: string, month: number, year: number): string {
  return `pay-${passengerId}-${year}-${String(month).padStart(2, "0")}`;
}

function defaultPaymentFor(passenger: Passenger, month: number, year: number): Payment {
  return {
    id: paymentIdFor(passenger.id, month, year),
    passengerId: passenger.id,
    mes: month,
    ano: year,
    valor: passenger.mensalidade,
    dataPagamento: null,
  };
}

export const usePaymentStore = create<PaymentStore>()((set, get) => ({
  currentMonth: { mes: 5, ano: 2026 },
  passengers: [],
  payments: [],
  hydrated: false,

  hydrateFromServer: async () => {
    const bootstrap = await apiBootstrap();
    set({
      currentMonth: bootstrap.currentMonth,
      passengers: [...bootstrap.passengers].sort(comparePassengers),
      payments: bootstrap.payments,
      hydrated: true,
    });
  },

  clear: () => {
    set({
      currentMonth: { mes: 5, ano: 2026 },
      passengers: [],
      payments: [],
      hydrated: false,
    });
  },

  monthPayments: (monthArg, yearArg) => {
    const { passengers, payments, currentMonth } = get();
    const { month, year } = resolveMonthYear(monthArg, yearArg, currentMonth);

    return passengers
      .map((passenger) => {
        const payment =
          payments.find((item) => item.passengerId === passenger.id && item.mes === month && item.ano === year) ??
          defaultPaymentFor(passenger, month, year);
        return {
          passenger,
          payment,
          status: getPaymentStatus(payment, passenger),
        };
      })
      .sort((a, b) => comparePassengers(a.passenger, b.passenger));
  },

  totalExpectedInMonth: (monthArg, yearArg) => {
    const rows = get().monthPayments(monthArg, yearArg);
    return rows.reduce((sum, row) => sum + row.payment.valor, 0);
  },

  totalReceivedInMonth: (monthArg, yearArg) =>
    get()
      .monthPayments(monthArg, yearArg)
      .reduce((sum, item) => (item.payment.dataPagamento ? sum + item.payment.valor : sum), 0),

  paidCountInMonth: (monthArg, yearArg) => get().monthPayments(monthArg, yearArg).filter((item) => item.status === "pago").length,
  pendingCountInMonth: (monthArg, yearArg) => get().monthPayments(monthArg, yearArg).filter((item) => item.status === "pendente").length,
  overdueCountInMonth: (monthArg, yearArg) => get().monthPayments(monthArg, yearArg).filter((item) => item.status === "atrasado").length,

  routeSummary: (monthArg, yearArg) => {
    const base = ROUTE_ORDER.map((rota) => ({ rota, paid: 0, total: 0 }));
    for (const row of get().monthPayments(monthArg, yearArg)) {
      const target = base.find((x) => x.rota === row.passenger.rota);
      if (!target) continue;
      target.total += 1;
      if (row.status === "pago") target.paid += 1;
    }
    return base;
  },

  markAsPaid: (passengerId, monthArg, yearArg) => {
    const { currentMonth } = get();
    const { month, year } = resolveMonthYear(monthArg, yearArg, currentMonth);

    set((state) => ({
      payments: (() => {
        const existing = state.payments.find((payment) => payment.passengerId === passengerId && payment.mes === month && payment.ano === year);
        if (!existing) {
          const passenger = state.passengers.find((item) => item.id === passengerId);
          if (!passenger) return state.payments;
          return [
            ...state.payments,
            {
              id: paymentIdFor(passengerId, month, year),
              passengerId,
              mes: month,
              ano: year,
              valor: passenger.mensalidade,
              dataPagamento: todayIsoDate(),
            },
          ];
        }

        return state.payments.map((payment) =>
          payment.passengerId === passengerId && payment.mes === month && payment.ano === year
            ? { ...payment, dataPagamento: payment.dataPagamento ?? todayIsoDate() }
            : payment,
        );
      })(),
    }));

    void apiMarkAsPaid(passengerId, month, year).catch(() => {
      // keep optimistic update to avoid disrupting current UX
    });
  },

  restorePaymentDate: (passengerId, monthArg, previousDate, yearArg) => {
    const { currentMonth } = get();
    const { month, year } = resolveMonthYear(monthArg, yearArg, currentMonth);

    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.passengerId === passengerId && payment.mes === month && payment.ano === year
          ? { ...payment, dataPagamento: previousDate }
          : payment,
      ),
    }));

    void apiRestoreDate(passengerId, month, year, previousDate).catch(() => {
      // keep optimistic update to avoid disrupting current UX
    });
  },

  addPassenger: async (payload) => {
    const created = await apiCreatePassenger(payload);
    set((state) => ({
      passengers: [...state.passengers, created].sort(comparePassengers),
      payments: [
        ...state.payments,
        {
          id: paymentIdFor(created.id, state.currentMonth.mes, state.currentMonth.ano),
          passengerId: created.id,
          mes: state.currentMonth.mes,
          ano: state.currentMonth.ano,
          valor: created.mensalidade,
          dataPagamento: null,
        },
      ],
    }));
    return created;
  },

  deletePassenger: async (passengerId) => {
    await apiDeletePassenger(passengerId);
    set((state) => ({
      passengers: state.passengers.filter((p) => p.id !== passengerId),
      payments: state.payments.filter((p) => p.passengerId !== passengerId),
    }));
  },

  findByPhone: async (phone) => {
    const normalizedPhone = digitsOnly(phone);
    if (normalizedPhone.length !== 11) return null;

    try {
      const result = await apiLookupByPhone(phone);
      const passenger = result.passenger;
      const history = result.history.map((payment) => ({
        month: payment.mes,
        year: payment.ano,
        payment,
        status: getPaymentStatus(payment, passenger),
      }));
      return { passenger, history };
    } catch {
      return null;
    }
  },
}));

