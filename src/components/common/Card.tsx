import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{ elevated?: boolean; className?: string }>;

export function Card({ elevated = false, className = "", children }: CardProps) {
  return (
    <section className={`${elevated ? "rounded-card-lg shadow-card-hi" : "rounded-card shadow-card"} bg-white p-4 ${className}`.trim()}>
      {children}
    </section>
  );
}
