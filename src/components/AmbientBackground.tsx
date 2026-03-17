"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/*
  Scroll-driven ambient gradient background.

  Emotional journey:
    0-15%  Hero         → Warm amber glow (auspicious, inviting)
    15-35% Problem      → Shifts red/warm (tension, anxiety)
    35-55% Turn/Phones  → Teal/green emerges (clarity, relief)
    55-75% Features     → Calm teal (confidence, control)
    75-90% Timeline     → Warm amber returns (aspiration)
    90-100% CTA         → Deep amber/gold (action, warmth)
*/

export function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // ─── Primary orb (large, top-left area) ───
  const primaryHue = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1],
    [30, 10, 170, 170, 35, 30, 30]
  );
  const primarySat = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.55, 0.75, 1],
    [80, 70, 60, 50, 70, 80]
  );
  const primaryX = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    ["15%", "25%", "10%", "20%"]
  );
  const primaryY = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["10%", "30%", "50%", "70%", "85%"]
  );
  const primaryOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.9, 1],
    [0.08, 0.12, 0.10, 0.14]
  );

  // ─── Secondary orb (medium, right side) ───
  const secondaryHue = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [35, 350, 160, 150, 40, 35]
  );
  const secondaryX = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    ["75%", "65%", "80%", "70%"]
  );
  const secondaryY = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["20%", "40%", "55%", "65%", "90%"]
  );
  const secondaryOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.9, 1],
    [0.06, 0.10, 0.08, 0.12]
  );

  // ─── Tertiary orb (small, center-bottom accent) ───
  const tertiaryHue = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    [45, 15, 140, 40]
  );
  const tertiaryY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["60%", "45%", "75%"]
  );
  const tertiaryOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.04, 0.08, 0.06, 0.10]
  );

  // ─── Jaali pattern parallax drift ───
  const jaaliX = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const jaaliY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* Primary orb */}
      <motion.div
        className="absolute h-[60vmax] w-[60vmax] rounded-full blur-[120px]"
        style={{
          left: primaryX,
          top: primaryY,
          opacity: primaryOpacity,
          background: useTransform(
            [primaryHue, primarySat],
            ([h, s]) => `radial-gradient(circle, hsl(${h}, ${s}%, 50%) 0%, transparent 70%)`
          ),
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Secondary orb */}
      <motion.div
        className="absolute h-[45vmax] w-[45vmax] rounded-full blur-[100px]"
        style={{
          left: secondaryX,
          top: secondaryY,
          opacity: secondaryOpacity,
          background: useTransform(
            [secondaryHue],
            ([h]) => `radial-gradient(circle, hsl(${h}, 60%, 45%) 0%, transparent 70%)`
          ),
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Tertiary orb */}
      <motion.div
        className="absolute h-[35vmax] w-[35vmax] rounded-full blur-[80px]"
        style={{
          left: "50%",
          top: tertiaryY,
          opacity: tertiaryOpacity,
          background: useTransform(
            [tertiaryHue],
            ([h]) => `radial-gradient(circle, hsl(${h}, 70%, 50%) 0%, transparent 70%)`
          ),
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Jaali (lattice) pattern overlay — subtle Indian architectural screen texture */}
      <motion.div
        className="absolute inset-[-10%] opacity-[0.025]"
        style={{
          x: jaaliX,
          y: jaaliY,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 L40 20 L20 40 L0 20 Z' fill='none' stroke='%23C17817' stroke-width='0.5'/%3E%3Cpath d='M20 8 L32 20 L20 32 L8 20 Z' fill='none' stroke='%23C17817' stroke-width='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Subtle noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}
