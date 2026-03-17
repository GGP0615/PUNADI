"use client";

import { motion, useReducedMotion } from "framer-motion";

interface CharacterRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  gradient?: boolean;
  gradientClass?: string;
}

export function CharacterReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.03,
  as: Tag = "span",
  gradient = false,
  gradientClass = "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent",
}: CharacterRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  const chars = text.split("");

  return (
    <Tag className={className} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.4,
            delay: delay + i * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`inline-block ${char === " " ? "w-[0.25em]" : ""} ${
            gradient ? gradientClass : ""
          }`}
          aria-hidden
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </Tag>
  );
}
