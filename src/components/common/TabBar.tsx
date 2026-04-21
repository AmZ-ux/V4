import { CreditCard, LayoutGrid, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard-admin", label: "Inicio", Icon: LayoutGrid },
  { to: "/passageiros", label: "Passageiros", Icon: Users },
  { to: "/pagamentos", label: "Pagamentos", Icon: CreditCard },
];

export function TabBar() {
  const reduced = useReducedMotion();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex h-[80px] w-full max-w-[480px] items-start border-t border-black/5 bg-white px-2 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      {items.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} end={to === "/dashboard-admin"} className="relative flex flex-1 flex-col items-center gap-1 pt-1 text-center">
          {({ isActive }) => (
            <>
              <span className="relative h-[7px]">
                {isActive ? (
                  <motion.span
                    layoutId={reduced ? undefined : "tab-indicator"}
                    className="absolute left-1/2 top-0 block h-[3px] w-6 -translate-x-1/2 rounded-pill bg-brand-700"
                    transition={{ type: "spring", stiffness: 450, damping: 38 }}
                  />
                ) : null}
              </span>
              <Icon className={`h-5 w-5 ${isActive ? "text-brand-700" : "text-ink-400"}`} strokeWidth={1.75} />
              <span className={`text-[12px] ${isActive ? "font-semibold text-brand-700" : "font-normal text-ink-400"}`}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
