"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface FlipCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

function FlipDigit({ digit, delay }: { digit: number; delay: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden align-top">
      <motion.span
        className="absolute left-0 top-0 flex w-full flex-col items-center"
        initial={{ y: "0em" }}
        animate={{ y: `${-digit}em` }}
        transition={{
          delay,
          duration: 0.8,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="flex h-[1em] w-full items-center justify-center leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function FlipCounter({
  value,
  suffix,
  prefix,
  className = "",
}: FlipCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const reduced = useReducedMotion();
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (inView) setTriggered(true);
  }, [inView]);

  const formatted = value.toLocaleString("en-IN");
  const chars = formatted.split("");

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {prefix}{formatted}{suffix}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {prefix && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={triggered ? { opacity: 1 } : {}}
          transition={{ duration: 0.3 }}
        >
          {prefix}
        </motion.span>
      )}
      {chars.map((char, i) => {
        if (char === ",") {
          return (
            <motion.span
              key={`comma-${i}`}
              initial={{ opacity: 0 }}
              animate={triggered ? { opacity: 1 } : {}}
              transition={{ delay: 0.12 * i + 0.2, duration: 0.3 }}
            >
              ,
            </motion.span>
          );
        }
        const digit = parseInt(char);
        return triggered ? (
          <FlipDigit key={`digit-${i}`} digit={digit} delay={0.12 * i} />
        ) : (
          <span key={`placeholder-${i}`} className="inline-block w-[0.58em]" />
        );
      })}
      {suffix && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={triggered ? { opacity: 1 } : {}}
          transition={{
            delay: 0.12 * chars.length + 0.2,
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {suffix}
        </motion.span>
      )}
    </div>
  );
}

/** Special "Zero" stat with dramatic scale + pulse */
export function ZeroStat({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className="text-center">
      <div className="relative inline-block font-[var(--font-space-grotesk)] text-4xl font-bold text-amber-400 sm:text-5xl">
        <motion.span
          initial={reduced ? {} : { scale: 0.5, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{
            duration: 0.6,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="inline-block"
        >
          Zero
        </motion.span>
        {inView && !reduced && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-red-500/40"
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          />
        )}
      </div>
      <p className="mt-2 text-sm text-[#737373]">{label}</p>
    </div>
  );
}
