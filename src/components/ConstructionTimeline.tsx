"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const phases = [
  {
    icon: "\uD83E\uDE94",
    title: "Bhoomi Puja",
    subtitle: "It all starts here",
    desc: "The auspicious beginning. Set your budget, list your materials, define your vision.",
  },
  {
    icon: "\u26CF\uFE0F",
    title: "Foundation",
    subtitle: "Digging, PCC, footings",
    desc: "The most critical phase. Track every load of sand, every bag of cement poured.",
  },
  {
    icon: "\uD83C\uDFD7\uFE0F",
    title: "Structure",
    subtitle: "Columns, beams, slabs",
    desc: "Steel and concrete take shape. Monitor material consumption against estimates.",
  },
  {
    icon: "\uD83E\uDDF1",
    title: "Walls",
    subtitle: "Brickwork & plastering",
    desc: "Your home starts to feel real. Log progress photos daily — watch it rise.",
  },
  {
    icon: "\uD83C\uDFE0",
    title: "Roof",
    subtitle: "Slab casting & waterproofing",
    desc: "The milestone everyone celebrates. You'll know exactly what it cost to get here.",
  },
  {
    icon: "\u26A1",
    title: "Finishing",
    subtitle: "Electrical, plumbing, paint",
    desc: "Where unplanned costs creep in. Punadi alerts you before the budget breaks.",
  },
  {
    icon: "\uD83C\uDF89",
    title: "Griha Pravesham",
    subtitle: "Welcome home",
    desc: "Every rupee accounted for. Every brick in its place. Your foundation is complete.",
  },
];

function TimelineNode({ phase, index, total, scrollYProgress }: {
  phase: typeof phases[0];
  index: number;
  total: number;
  scrollYProgress: any;
}) {
  const reduced = useReducedMotion();
  const threshold = 0.1 + (index / total) * 0.75;

  // Node pops when line reaches it
  const nodeScale = useTransform(
    scrollYProgress,
    [threshold - 0.05, threshold, threshold + 0.02],
    [0, 1.15, 1]
  );
  const nodeOpacity = useTransform(
    scrollYProgress,
    [threshold - 0.05, threshold],
    [0, 1]
  );

  return (
    <motion.div
      style={reduced ? {} : { opacity: nodeOpacity }}
      className="relative flex gap-5 sm:gap-6"
    >
      {/* Node dot */}
      <div className="relative z-10 flex-shrink-0">
        <motion.div
          style={reduced ? {} : { scale: nodeScale }}
          className={`flex h-[50px] w-[50px] items-center justify-center rounded-2xl border text-xl sm:h-[58px] sm:w-[58px] sm:text-2xl ${
            index === total - 1
              ? "border-amber-400/40 bg-amber-500/10 shadow-lg shadow-amber-500/20"
              : "border-white/10 bg-[#111]"
          }`}
        >
          {phase.icon}
        </motion.div>
      </div>

      {/* Content */}
      <div className="pt-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-amber-500/60">
          {phase.subtitle}
        </p>
        <h3
          className={`mt-1 font-[var(--font-space-grotesk)] text-xl font-bold sm:text-2xl ${
            index === total - 1 ? "text-amber-400" : "text-white"
          }`}
        >
          {phase.title}
        </h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[#737373]">
          {phase.desc}
        </p>
      </div>
    </motion.div>
  );
}

export function ConstructionTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0.1, 0.85], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="relative mx-auto max-w-2xl px-6">
      {/* The drawn line */}
      <div className="absolute left-[39px] top-0 bottom-0 w-px bg-white/5 sm:left-[47px]">
        <motion.div
          className="w-full bg-gradient-to-b from-amber-500 via-amber-400 to-amber-600 origin-top"
          style={{ height: lineHeight }}
        />
      </div>

      {/* Timeline nodes */}
      <div className="space-y-16">
        {phases.map((phase, i) => (
          <TimelineNode
            key={phase.title}
            phase={phase}
            index={i}
            total={phases.length}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
}
