"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/* Плавающие линии-пути на фон (адаптировано под бренд: цвет через currentColor).
   animate=false → статичный паттерн (для «голых» белых секций, без нагрузки). */
function PathsGroup({ position, animate }: { position: number; animate: boolean }) {
  const paths = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 1 + i * 0.07,
  }));

  return (
    <svg className="h-full w-full" viewBox="0 0 696 316" fill="none" preserveAspectRatio="none">
      {paths.map((path) =>
        animate ? (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.25 + path.id * 0.045}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: [0.5, 0.95, 0.5], pathOffset: [0, 1, 0] }}
            transition={{ duration: 20 + (path.id % 10) * 1.5, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <path key={path.id} d={path.d} stroke="currentColor" strokeWidth={path.width} strokeOpacity={0.18 + path.id * 0.035} />
        )
      )}
    </svg>
  );
}

export function FloatingPaths({ className, animate = true }: { className?: string; animate?: boolean }) {
  const reduce = useReducedMotion();
  const doAnimate = animate && !reduce;
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <PathsGroup position={1} animate={doAnimate} />
      <PathsGroup position={-1} animate={doAnimate} />
    </div>
  );
}
