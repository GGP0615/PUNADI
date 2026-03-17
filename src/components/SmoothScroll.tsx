"use client";

import { useEffect, useState, useCallback } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollVelocityContext } from "@/hooks/useScrollVelocity";
import { scrollProgress } from "@/lib/scrollProgress";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [velocity, setVelocity] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    // Reset scroll position on page load/refresh
    window.scrollTo(0, 0);
    scrollProgress.set(0);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      autoResize: true,
    });

    lenis.on("scroll", (e: any) => {
      ScrollTrigger.update();
      setVelocity(Math.abs(e.velocity));
      setDirection(e.direction);

      // Update scroll bridge for 3D canvas
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        scrollProgress.set(window.scrollY / scrollHeight);
      }
    });

    const rafCallback = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(rafCallback);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <ScrollVelocityContext.Provider value={{ velocity, direction }}>
      {children}
    </ScrollVelocityContext.Provider>
  );
}
