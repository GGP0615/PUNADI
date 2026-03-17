"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useTilt } from "@/hooks/useTilt";
import { PhoneMockup } from "./PhoneMockup";

interface TiltPhoneProps {
  children: React.ReactNode;
  label?: string;
  delay?: number;
  className?: string;
  /** Feature section entrance: swing in from rotated */
  swingIn?: boolean;
}

export function TiltPhone({
  children,
  label,
  delay = 0,
  className = "",
  swingIn = false,
}: TiltPhoneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const tilt = useTilt({ maxTiltX: 5, maxTiltY: 8 });

  // Scroll-based subtle tilt for non-interactive scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const scrollRotateX = useTransform(scrollYProgress, [0, 1], [-5, 5]);
  const scrollRotateY = useTransform(scrollYProgress, [0, 1], [-3, 3]);

  return (
    <motion.div
      ref={containerRef}
      initial={
        reduced
          ? {}
          : swingIn
            ? { opacity: 0, rotateY: 25 }
            : { opacity: 0, y: 80 }
      }
      whileInView={
        reduced
          ? {}
          : swingIn
            ? { opacity: 1, rotateY: 0 }
            : { opacity: 1, y: 0 }
      }
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`flex flex-col items-center ${className}`}
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        style={{
          rotateX: reduced ? 0 : tilt.style.rotateX || scrollRotateX,
          rotateY: reduced ? 0 : tilt.style.rotateY || scrollRotateY,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="relative">
          <PhoneMockup>{children}</PhoneMockup>
          {/* Glass reflection overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-[40px] bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
        </div>
      </motion.div>
      {label && (
        <p className="mt-5 text-xs font-medium uppercase tracking-wider text-[#525252]">
          {label}
        </p>
      )}
    </motion.div>
  );
}
