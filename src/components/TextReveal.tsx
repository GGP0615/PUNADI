"use client";

import { motion, useReducedMotion } from "framer-motion";

type RevealMode = "fadeUp" | "slideIn" | "clipReveal" | "blur";

interface TextRevealProps {
  children: string;
  mode?: RevealMode;
  split?: "word" | "char";
  stagger?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
}

const modeVariants: Record<RevealMode, { hidden: any; visible: any }> = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  slideIn: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  clipReveal: {
    hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
    visible: { opacity: 1, clipPath: "inset(0 0% 0 0)" },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(12px)", y: 10 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
};

const modeTransitions: Record<RevealMode, any> = {
  fadeUp: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  slideIn: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  clipReveal: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  blur: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

export function TextReveal({
  children,
  mode = "fadeUp",
  split = "word",
  stagger = 0.08,
  className = "",
  as: Tag = "div",
}: TextRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <Tag className={className}>{children}</Tag>;
  }

  const units = split === "word" ? children.split(" ") : children.split("");
  const variants = modeVariants[mode];
  const transition = modeTransitions[mode];

  return (
    <Tag className={className} aria-label={children}>
      {units.map((unit, i) => (
        <motion.span
          key={`${unit}-${i}`}
          className="inline-block"
          initial={variants.hidden}
          whileInView={variants.visible}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            ...transition,
            delay: i * stagger,
          }}
          aria-hidden
        >
          {unit}
          {split === "word" && i < units.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
