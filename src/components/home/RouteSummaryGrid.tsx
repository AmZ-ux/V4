import { FileText, GraduationCap } from "lucide-react";

import { Card } from "@/components/common/Card";
import type { Route } from "@/types";

interface Item {
  rota: Route;
  paid: number;
  total: number;
}

export function RouteSummaryGrid({ rows }: { rows: Item[] }) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const Icon = row.rota === "CONTRATOS" ? FileText : GraduationCap;
        return (
          <Card key={row.rota} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
                  <Icon className={`h-5 w-5 ${row.rota === "CONTRATOS" ? "text-gold-500" : "text-brand-700"}`} />
                </span>
                <div>
                  <p className="text-[14px] font-bold text-ink-900">{row.rota}</p>
                  <p className="text-[14px] text-ink-700">{row.paid}/{row.total} pagos</p>
                </div>
              </div>
              <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border-[3px] border-brand-700 px-2 text-[22px] font-extrabold leading-none text-ink-900">
                {row.total}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
