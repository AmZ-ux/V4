import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/common/Card";

interface InfoActionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export function InfoActionCard({ icon: Icon, title, subtitle }: InfoActionCardProps) {
  return (
    <Card className="flex items-center gap-3 p-3.5">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
        <Icon className="h-5 w-5 text-brand-700" />
      </span>
      <span>
        <strong className="block text-[15px] text-ink-900">{title}</strong>
        <span className="block text-[13px] text-ink-500">{subtitle}</span>
      </span>
    </Card>
  );
}
