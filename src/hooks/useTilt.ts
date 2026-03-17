"use client";

import { useRef, useCallback } from "react";
import { useMotionValue, useSpring, useReducedMotion } from "framer-motion";

interface TiltOptions {
  maxTiltX?: number;
  maxTiltY?: number;
  perspective?: number;
}

export function useTilt({
  maxTiltX = 5,
  maxTiltY = 8,
  perspective = 1200,
}: TiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const normalX = (e.clientX - centerX) / (rect.width / 2);
      const normalY = (e.clientY - centerY) / (rect.height / 2);
      rotateX.set(-normalY * maxTiltX);
      rotateY.set(normalX * maxTiltY);
    },
    [reduced, maxTiltX, maxTiltY, rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return {
    ref,
    style: reduced
      ? {}
      : {
          perspective,
          rotateX: springX,
          rotateY: springY,
          transformStyle: "preserve-3d" as const,
        },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
}
