"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { PunadiLogo } from "./PunadiLogo";
import { useScrollVelocity } from "@/hooks/useScrollVelocity";
import { MagneticButton } from "./MagneticButton";

const navLinks = [
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Features", href: "#features" },
  { label: "Timeline", href: "#timeline" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { velocity, direction } = useScrollVelocity();
  const reduced = useReducedMotion();
  const prevDirection = useRef(direction);

  // Velocity-responsive auto-hide
  useEffect(() => {
    if (reduced) return;
    // Hide on fast downward scroll
    if (direction === 1 && velocity > 1.5) {
      setHidden(true);
    }
    // Show when direction reverses or velocity drops
    else if (direction === -1 || velocity < 0.5) {
      setHidden(false);
    }
    prevDirection.current = direction;
  }, [velocity, direction, reduced]);

  return (
    <motion.nav
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/40 backdrop-blur-2xl backdrop-saturate-150"
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-3">
          <PunadiLogo className="h-10 w-10" />
          <span className="font-[var(--font-space-grotesk)] text-lg font-bold text-white">
            Punadi
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 sm:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link-hover relative text-sm text-[#737373] transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <MagneticButton strength={6} radius={80}>
            <a
              href="#waitlist"
              data-cursor="cta"
              className="rounded-full bg-white/5 px-5 py-2 text-sm font-medium text-white/80 ring-1 ring-white/10 transition-all hover:bg-white/10 hover:text-white"
            >
              Join Waitlist
            </a>
          </MagneticButton>
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex items-center gap-3 sm:hidden">
          <a
            href="#waitlist"
            className="rounded-full bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/10"
          >
            Waitlist
          </a>
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-2xl sm:hidden"
          >
            <div className="flex h-full flex-col px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PunadiLogo className="h-10 w-10" />
                  <span className="font-[var(--font-space-grotesk)] text-lg font-bold text-white">
                    Punadi
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-12 flex flex-1 flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                    className="rounded-xl px-4 py-4 font-[var(--font-space-grotesk)] text-2xl font-semibold text-white transition-colors hover:bg-white/5"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>

              <motion.a
                href="#waitlist"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="mb-4 block rounded-full bg-gradient-to-r from-amber-500 to-amber-600 py-4 text-center text-base font-semibold text-white shadow-lg shadow-amber-600/25"
              >
                Join the Waitlist
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
