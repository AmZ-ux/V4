import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CURRENT_MONTH, passengers as initialPassengers, payments as initialPayments } from "@/data/mockData";
import type { CurrentMonth, Passenger, Payment, PaymentStatus, Route } from "@/types";
import { digitsOnly } from "@/utils/phone";
import { todayIsoDate } from "@/utils/date";

const ROUTE_ORDER: Route[] = ["IFPI", "UESPI", "UFPI", "CONTRATOS"];

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
  monthPayments: (month?: number, year?: number) => PaymentWithPassenger[];
  totalExpectedInMonth: (month?: number, year?: number) => number;
  totalReceivedInMonth: (month?: number, year?: number) => number;
  paidCountInMonth: (month?: number, year?: number) => number;
  pendingCountInMonth: (month?: number, year?: number) => number;
  overdueCountInMonth: (month?: number, year?: number) => number;
  routeSummary: (month?: number, year?: number) => Array<{ rota: Route; paid: number; total: number }>;
  markAsPaid: (passengerId: string, month: number, year?: number) => void;
  restorePaymentDate: (passengerId: string, month: number, previousDate: string | null, year?: number) => void;
  addPassenger: (payload: Omit<Passenger, "id">) => void;
  deletePassenger: (passengerId: string) => void;
  findByPhone: (phone: string) => {
    passenger: Passenger;
    history: PassengerMonthHistory[];
  } | null;
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

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      currentMonth: CURRENT_MONTH,
      passengers: [...initialPassengers].sort(comparePassengers),
      payments: initialPayments,

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
        const id = paymentIdFor(passengerId, month, year);

        set((state) => ({
          payments: (() => {
            const existing = state.payments.find((payment) => payment.passengerId === passengerId && payment.mes === month && payment.ano === year);
            if (!existing) {
              const passenger = state.passengers.find((item) => item.id === passengerId);
              if (!passenger) return state.payments;
              return [
                ...state.payments,
                {
                  id,
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
      },

      restorePaymentDate: (passengerId, monthArg, previousDate, yearArg) => {
        const { currentMonth } = get();
        const { month, year } = resolveMonthYear(monthArg, yearArg, currentMonth);

        set((state) => {
          const existing = state.payments.find((payment) => payment.passengerId === passengerId && payment.mes === month && payment.ano === year);
          if (!existing) return state;
          return {
            payments: state.payments.map((payment) =>
              payment.passengerId === passengerId && payment.mes === month && payment.ano === year
                ? { ...payment, dataPagamento: previousDate }
                : payment,
            ),
          };
        });
      },

      addPassenger: (payload) => {
        const newId = `p${String(get().passengers.length + 1).padStart(2, "0")}`;
        const { currentMonth } = get();
        const newPassenger: Passenger = { id: newId, ...payload };
        const newPayment: Payment = {
          id: `pay-${newId}-${currentMonth.ano}-${String(currentMonth.mes).padStart(2, "0")}`,
          passengerId: newId,
          mes: currentMonth.mes,
          ano: currentMonth.ano,
          valor: payload.mensalidade,
          dataPagamento: null,
        };

        set((state) => ({
          passengers: [...state.passengers, newPassenger].sort(comparePassengers),
          payments: [...state.payments, newPayment],
        }));
      },

      deletePassenger: (passengerId) => {
        set((state) => ({
          passengers: state.passengers.filter((p) => p.id !== passengerId),
          payments: state.payments.filter((p) => p.passengerId !== passengerId),
        }));
      },

      findByPhone: (phone) => {
        const normalizedPhone = digitsOnly(phone);
        const { passengers, currentMonth } = get();
        const passenger = passengers.find((item) => digitsOnly(item.telefone) === normalizedPhone);
        if (!passenger) return null;

        const history: PassengerMonthHistory[] = [];
        for (let index = 0; index < 6; index += 1) {
          const currentDate = new Date(currentMonth.ano, currentMonth.mes - 1 - index, 1);
          const month = currentDate.getMonth() + 1;
          const year = currentDate.getFullYear();
          const payment =
            get().payments.find((item) => item.passengerId === passenger.id && item.mes === month && item.ano === year) ??
            defaultPaymentFor(passenger, month, year);
          history.push({
            month,
            year,
            payment,
            status: getPaymentStatus(payment, passenger),
          });
        }

        return {
          passenger,
          history,
        };
      },
    }),
    {
      name: "van-ease-pay-v2",
    },
  ),
);
