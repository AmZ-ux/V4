import type { PropsWithChildren } from "react";

export function ScreenHeaderGreen({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <header className={`bg-[linear-gradient(135deg,#0A4B2F_0%,#127A4B_100%)] ${className}`.trim()}>
      {children}
    </header>
  );
}
