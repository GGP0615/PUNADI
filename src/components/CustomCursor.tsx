"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/deviceTier";

type CursorState = "default" | "hover" | "cta" | "threed";

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const state = useRef<CursorState>("default");
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Desktop only + not reduced motion
    if (prefersReducedMotion()) return;
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;

    setVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const updateCursorState = () => {
      const el = document.elementFromPoint(mousePos.current.x, mousePos.current.y);
      if (!el) {
        state.current = "default";
        return;
      }

      // Check if hovering CTA button
      if (el.closest("[data-cursor='cta']")) {
        state.current = "cta";
      }
      // Check if hovering 3D canvas
      else if (el.closest("canvas")) {
        state.current = "threed";
      }
      // Check if hovering any clickable
      else if (
        el.closest("a, button, [role='button'], input, textarea, select, [data-cursor='hover']")
      ) {
        state.current = "hover";
      } else {
        state.current = "default";
      }
    };

    let raf: number;
    const animate = () => {
      const ring = ringRef.current;
      const dot = dotRef.current;
      if (!ring || !dot) {
        raf = requestAnimationFrame(animate);
        return;
      }

      // Spring-lag for ring
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;

      // Dot follows directly
      dot.style.transform = `translate(${mousePos.current.x - 4}px, ${mousePos.current.y - 4}px)`;

      updateCursorState();

      const s = state.current;
      const size = s === "hover" ? 48 : s === "cta" ? 0 : s === "threed" ? 24 : 32;
      const opacity = s === "cta" ? 0 : 1;
      const bgOpacity = s === "hover" ? 0.08 : 0;

      ring.style.transform = `translate(${ringPos.current.x - size / 2}px, ${ringPos.current.y - size / 2}px)`;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.opacity = String(opacity);
      ring.style.backgroundColor = `rgba(193, 120, 23, ${bgOpacity})`;

      // Dot visibility
      dot.style.opacity = s === "cta" ? "0" : "1";

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove);
    raf = requestAnimationFrame(animate);

    // Hide default cursor
    document.documentElement.style.cursor = "none";

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
      document.documentElement.style.cursor = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border border-amber-500/60 mix-blend-difference transition-[width,height,background-color] duration-200 ease-out"
        style={{ width: 32, height: 32 }}
      />
      {/* Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full bg-amber-400 mix-blend-difference"
      />
    </>
  );
}
