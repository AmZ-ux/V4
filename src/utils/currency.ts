import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatMonthYearCaps(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return format(date, "LLLL yyyy", { locale: ptBR }).toUpperCase();
}

export function formatMonthYearTitle(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  const label = format(date, "LLLL yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
