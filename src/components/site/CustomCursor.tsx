"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 250, damping: 26, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 250, damping: 26, mass: 0.5 });

  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const fine =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;

    setEnabled(true);
    document.body.classList.add("hide-native-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setHovering(
        !!t?.closest("a, button, [data-cursor='hover'], input, textarea")
      );
    };
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      document.body.classList.remove("hide-native-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* precise dot */}
      <motion.div
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
      >
        <motion.span
          animate={{ scale: hovering ? 2.4 : 1, opacity: hovering ? 0.3 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference"
        />
      </motion.div>
      {/* trailing ring */}
      <motion.div
        style={{ x: rx, y: ry }}
        className="pointer-events-none fixed left-0 top-0 z-[9998]"
      >
        <motion.span
          animate={{ scale: hovering ? 1.6 : 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="block h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 mix-blend-difference"
        />
      </motion.div>
    </>
  );
}
