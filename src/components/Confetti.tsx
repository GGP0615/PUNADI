"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const COLORS = ["#C17817", "#D4941F", "#F59E0B", "#1A6B6A", "#22C55E", "#FFD700"];
const PARTICLE_COUNT = 35;

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  velocity: number;
  rotation: number;
  shape: "circle" | "square" | "triangle";
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: 0,
    y: 0,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 4 + Math.random() * 8,
    angle: (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5,
    velocity: 200 + Math.random() * 300,
    rotation: Math.random() * 360,
    shape: (["circle", "square", "triangle"] as const)[Math.floor(Math.random() * 3)],
  }));
}

export function Confetti({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (trigger && !reduced) {
      setParticles(generateParticles());
      const timer = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger, reduced]);

  return (
    <AnimatePresence>
      {particles.map((p) => {
        const endX = Math.cos(p.angle) * p.velocity;
        const endY = Math.sin(p.angle) * p.velocity * -0.8; // Bias upward

        return (
          <motion.div
            key={p.id}
            className="pointer-events-none absolute"
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              x: endX,
              y: [endY, endY + 200], // Gravity effect
              opacity: [1, 1, 0],
              scale: [0, 1, 0.5],
              rotate: p.rotation + 360,
            }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
            }}
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === "circle" ? "50%" : p.shape === "triangle" ? "0" : "2px",
              clipPath:
                p.shape === "triangle"
                  ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                  : undefined,
            }}
          />
        );
      })}
    </AnimatePresence>
  );
}
