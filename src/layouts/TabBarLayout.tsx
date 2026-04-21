import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";

import { TabBar } from "@/components/common/TabBar";

export function TabBarLayout() {
  const location = useLocation();
  const reduced = useReducedMotion();

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-brand-50 shadow-xl">
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname + location.search}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={reduced ? {} : { opacity: 1, y: 0 }}
          exit={reduced ? {} : { opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="min-h-screen pb-28"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <TabBar />
    </div>
  );
}
