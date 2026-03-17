"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is Punadi free?",
    a: "Punadi will have a free tier with core tracking features. Premium features like PDF reports, advanced analytics, and family sharing will be available via a subscription.",
  },
  {
    q: "Do I need internet to use it?",
    a: "No. Punadi works fully offline. All data stays on your device. You only need internet for optional cloud backup and family sharing.",
  },
  {
    q: "Can my family see the updates?",
    a: "Yes. With the family sharing feature, you can invite family members to view (but not edit) your construction progress, budget, and photos in real-time.",
  },
  {
    q: "What languages does it support?",
    a: "Punadi will launch with English, Telugu (తెలుగు), and Hindi (हिन्दी). More regional languages will be added based on demand.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="border-b border-white/5"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="font-[var(--font-space-grotesk)] text-base font-semibold text-white pr-4">
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-[#525252]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-[#737373]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section className="relative z-10 border-t border-white/5 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-amber-500">
            FAQ
          </p>
          <h2 className="mt-4 font-[var(--font-space-grotesk)] text-3xl font-bold text-white sm:text-4xl">
            Questions? Answers.
          </h2>
        </motion.div>

        <div className="divide-y-0">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
