"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const phases = [
  { pos: 0.05, label: "Hero" },
  { pos: 0.15, label: "Problem" },
  { pos: 0.3, label: "Solution" },
  { pos: 0.45, label: "Features" },
  { pos: 0.6, label: "How It Works" },
  { pos: 0.75, label: "Timeline" },
  { pos: 0.9, label: "Waitlist" },
];

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (reduced) return null;

  return (
    <div className="fixed right-4 top-0 z-40 hidden h-screen w-[2px] lg:block">
      {/* Track */}
      <div className="absolute inset-0 bg-white/5" />
      {/* Progress fill */}
      <motion.div
        className="absolute left-0 top-0 w-full bg-gradient-to-b from-amber-500 to-amber-600 origin-top"
        style={{ height }}
      />

      {/* Phase dots */}
      {phases.map((phase) => {
        const dotOpacity = useTransform(
          scrollYProgress,
          [phase.pos - 0.05, phase.pos],
          [0.2, 1]
        );
        const dotScale = useTransform(
          scrollYProgress,
          [phase.pos - 0.05, phase.pos],
          [0.5, 1]
        );

        return (
          <motion.div
            key={phase.label}
            className="group absolute -left-[5px] flex items-center"
            style={{ top: `${phase.pos * 100}%` }}
          >
            <motion.div
              className="h-3 w-3 rounded-full border border-amber-500/40 bg-[#0A0A0A]"
              style={{ opacity: dotOpacity, scale: dotScale }}
            >
              <motion.div
                className="h-full w-full rounded-full bg-amber-500"
                style={{ opacity: dotOpacity }}
              />
            </motion.div>
            {/* Tooltip on hover */}
            <div className="pointer-events-none ml-3 rounded-md bg-[#1A1A1A] px-2 py-1 text-[10px] text-white/60 opacity-0 transition-opacity group-hover:opacity-100">
              {phase.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
