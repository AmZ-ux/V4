import type { PropsWithChildren } from "react";

export function SectionEyebrow({ children }: PropsWithChildren) {
  return <h2 className="mt-6 mb-3 text-[13px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">{children}</h2>;
}
