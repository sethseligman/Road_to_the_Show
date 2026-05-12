"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { StatToast } from "@/components/StatChangeToast";

export function StatChangePop({ items }: { items: StatToast[] }) {
  return (
    <div className="pointer-events-none fixed right-3 top-1/3 z-50 flex max-w-[46vw] flex-col items-end gap-2 sm:right-[calc(18rem+1rem)] lg:top-1/4">
      <AnimatePresence mode="popLayout">
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 28, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 20,
              mass: 0.65,
            }}
            className={`rounded-full border px-3 py-1.5 font-mono text-sm font-bold tabular-nums shadow-lg ${
              t.delta >= 0
                ? "border-[color:color-mix(in_srgb,var(--accent-positive)_45%,transparent)] bg-emerald-500/95 text-emerald-950"
                : "border-[color:color-mix(in_srgb,var(--accent-negative)_45%,transparent)] bg-red-500/95 text-white"
            }`}
          >
            {t.delta >= 0 ? "+" : ""}
            {t.delta} {t.label}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
