"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

export function WaitlistCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false });
  const reduced = useReducedMotion();

  // Base count — randomized only after mount to avoid hydration mismatch
  const [count, setCount] = useState(200);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setCount(200 + Math.floor(Math.random() * 50));
    }
  }, []);

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      const delay = 30000 + Math.random() * 15000; // 30-45s
      setTimeout(() => {
        setCount((c) => c + 1);
      }, delay);
    }, 35000);

    return () => clearInterval(interval);
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      initial={reduced ? {} : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-6 flex items-center justify-center gap-2"
    >
      <div className="flex items-center gap-1.5">
        {/* Animated dot */}
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
        </span>
        <span className="text-sm text-[#737373]">
          Join{" "}
          <motion.span
            key={count}
            initial={reduced ? {} : { opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-medium text-teal-400"
          >
            {count}+
          </motion.span>{" "}
          families building smarter
        </span>
      </div>
    </motion.div>
  );
}
