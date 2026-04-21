import { digitsOnly } from "@/utils/phone";

export function openWhatsApp(phone: string, message: string): void {
  const cleanPhone = digitsOnly(phone);
  if (cleanPhone.length < 10) return;
  const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
