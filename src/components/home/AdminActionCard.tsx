import type { LucideIcon } from "lucide-react";

import { ChevronRight } from "@/components/common/ChevronRight";

type Variant = "danger" | "warning" | "success";

const styles = {
  danger: {
    root: "bg-[#FBE6E8]",
    icon: "text-[#E63946]",
    title: "text-[#D62839]",
    subtitle: "text-[#9F2B36]",
  },
  warning: {
    root: "bg-[#FAF1DC]",
    icon: "text-[#9E7A2A]",
    title: "text-[#8A5A1F]",
    subtitle: "text-[#7A5721]",
  },
  success: {
    root: "bg-[#D9EFDF]",
    icon: "text-[#00A19B]",
    title: "text-[#0A5B3A]",
    subtitle: "text-[#22573D]",
  },
} as const;

interface AdminActionCardProps {
  variant: Variant;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
}

export function AdminActionCard({ variant, icon: Icon, title, subtitle, onClick }: AdminActionCardProps) {
  const ui = styles[variant];

  return (
    <button
      aria-label={title}
      type="button"
      onClick={onClick}
      className={`mb-3 flex h-[76px] w-full items-center gap-3 rounded-card p-3.5 text-left ${ui.root}`.trim()}
    >
      <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white">
        <Icon className={`h-5 w-5 ${ui.icon}`.trim()} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className={`block text-body-md font-bold ${ui.title}`.trim()}>{title}</strong>
        <span className={`block truncate text-[13px] ${ui.subtitle}`.trim()}>{subtitle}</span>
      </span>
      <ChevronRight className={ui.title} />
    </button>
  );
}
