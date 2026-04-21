import { format } from "date-fns";

export function formatDMY(date: Date | string): string {
  const parsed = typeof date === "string" ? new Date(`${date}T12:00:00`) : date;
  return format(parsed, "dd/MM/yyyy");
}

export function todayIsoDate(): string {
  return format(new Date(), "yyyy-MM-dd");
}
