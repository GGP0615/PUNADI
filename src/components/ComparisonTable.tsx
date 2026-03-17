"use client";

import { motion, useReducedMotion } from "framer-motion";

const rows = [
  { before: "WhatsApp receipts", after: "Organized photo log" },
  { before: "\"I think we bought 200 bags\"", after: "Exact material tracking" },
  { before: "Budget surprises at month 6", after: "Real-time dashboard" },
  { before: "Family asking daily", after: "Shared visibility" },
];

export function ComparisonTable() {
  const reduced = useReducedMotion();

  return (
    <section className="relative z-10 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {/* Headers */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-center"
          >
            <span className="text-xs font-medium uppercase tracking-widest text-red-400/70">
              Before Punadi
            </span>
          </motion.div>
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 text-center"
          >
            <span className="text-xs font-medium uppercase tracking-widest text-teal-400/70">
              With Punadi
            </span>
          </motion.div>

          {/* Rows */}
          {rows.map((row, i) => (
            <motion.div key={row.before} className="contents">
              {/* Before */}
              <motion.div
                initial={reduced ? {} : { opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-4"
              >
                <motion.p
                  className="text-sm text-red-300/70"
                  whileInView={reduced ? {} : { textDecoration: "line-through" }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.5, duration: 0.3 }}
                >
                  {row.before}
                </motion.p>
              </motion.div>
              {/* After */}
              <motion.div
                initial={reduced ? {} : { opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1 + 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-xl border border-teal-500/10 bg-teal-500/[0.03] p-4"
              >
                <p className="text-sm text-teal-300/80">{row.after}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
