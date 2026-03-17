"use client";

import dynamic from "next/dynamic";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Lock,
  Globe,
  Smartphone,
  WifiOff,
  Camera,
  Package,
  IndianRupee,
} from "lucide-react";
import {
  PhoneMockup,
  DailyLogScreen,
  MaterialTrackerScreen,
  BudgetScreen,
} from "@/components/PhoneMockup";
import { ConstructionTimeline } from "@/components/ConstructionTimeline";
import { SmoothScroll } from "@/components/SmoothScroll";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Nav } from "@/components/Nav";
import { PunadiLogo } from "@/components/PunadiLogo";
import { FlipCounter, ZeroStat } from "@/components/FlipCounter";
import { TextReveal } from "@/components/TextReveal";
import { MagneticButton } from "@/components/MagneticButton";
import { CustomCursor } from "@/components/CustomCursor";
import { TiltPhone } from "@/components/TiltPhone";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ComparisonTable } from "@/components/ComparisonTable";
import { FAQ } from "@/components/FAQ";
import { WaitlistCounter } from "@/components/WaitlistCounter";
import { Confetti } from "@/components/Confetti";
import { scrollProgress } from "@/lib/scrollProgress";

/* ─── Loading micro-story ─── */
const loadingMessages = [
  "Laying the foundation...",
  "Stacking the bricks...",
  "Mixing the cement...",
  "Almost ready...",
];

function LoadingMicroStory() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % loadingMessages.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0A]">
      <div className="flex flex-col items-center gap-4">
        <PunadiLogo className="h-12 w-12 animate-pulse" />
        <span className="text-sm text-[#525252]">
          {loadingMessages[msgIdx]}
        </span>
      </div>
    </div>
  );
}

const HeroScene = dynamic(
  () => import("@/components/3d/Scene").then((mod) => mod.HeroScene),
  {
    ssr: false,
    loading: () => <LoadingMicroStory />,
  }
);

/* ─── Problem pain-point cards ─── */
const painPoints = [
  {
    quote: "\u201C\u20B94,500 for bricks. Or was it \u20B95,400?\u201D",
    detail:
      "Expenses tracked in WhatsApp chats, scribbled in notebooks, or worse \u2014 trusted to memory. Receipts disappear. Numbers don\u2019t add up.",
    side: "left" as const,
  },
  {
    quote: "\u201CThe mistry said 200 bags. We bought 280.\u201D",
    detail:
      "Material estimates are guesses. Nobody tracks what was ordered vs. what was used. The gap is your money, gone.",
    side: "right" as const,
  },
  {
    quote: "\u201CAmma calls every evening: \u2018How much today?\u2019\u201D",
    detail:
      "Family wants visibility. You want accountability. But nobody has a single source of truth.",
    side: "left" as const,
  },
  {
    quote: "\u201CWe\u2019re 3 lakhs over. When did that happen?\u201D",
    detail:
      "By month 6, you\u2019ve lost track of cement ordered, mistry wages paid, and whether you\u2019re still within budget. The answer is usually no.",
    side: "right" as const,
  },
];

/* ─── Feature deep-dive data ─── */
const featureDeepDives = [
  {
    label: "Daily Photo Log",
    title: "Amma took a photo. Added a note.",
    subtitle: "\u20B94,500 for bricks from Ramesh. Done.",
    detail:
      "Every day, snap a photo of the site. Add what happened, what it cost. 30 seconds. Timestamped, organized, searchable. Replaces WhatsApp voice notes forever.",
    accent: "amber",
    Screen: DailyLogScreen,
  },
  {
    label: "Material Tracker",
    title: "Cement: 180 of 200 bags.",
    subtitle: "Bricks running low \u2014 20% remaining.",
    detail:
      "Log your estimated quantities at the start. As you buy, Punadi tracks consumption. When materials drop below 20%, you get an alert \u2014 before it becomes a site shutdown.",
    accent: "teal",
    Screen: MaterialTrackerScreen,
  },
  {
    label: "Budget Dashboard",
    title: "Planned: \u20B924,00,000.",
    subtitle: "Spent: \u20B921,47,000. Under budget.",
    detail:
      "Materials, labour, unplanned repairs \u2014 every category tracked. See the gap between planned and actual in real time. Know exactly where every rupee went.",
    accent: "green",
    Screen: BudgetScreen,
  },
];

/* ─── Easter egg: 5 rapid clicks counter ─── */
let brickClickCount = 0;
let brickClickTimer: ReturnType<typeof setTimeout> | null = null;

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const reduced = useReducedMotion();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Extended hero visibility + subtle scale
  const heroOpacity = useTransform(
    heroProgress,
    [0, 0.4, 0.7, 1],
    [1, 1, 0.3, 0]
  );
  const heroScale = useTransform(heroProgress, [0, 0.5, 1], [1, 1, 0.95]);

  // Write scroll progress to bridge for 3D canvas
  const { scrollYProgress: pageProgress } = useScroll();
  useMotionValueEvent(pageProgress, "change", (v) => {
    scrollProgress.set(v);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
        setEmail("");
      }
    } catch {
      // Silently fail — still show success for UX
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] font-[var(--font-inter)]">
        {/* Custom cursor (desktop only) */}
        <CustomCursor />

        {/* Scroll progress indicator (desktop) */}
        <ScrollProgress />

        {/* Scroll-driven ambient gradient background */}
        <AmbientBackground />

        {/* ═══ NAV ═══ */}
        <Nav />

        {/* ═══ SECTION 1 — HERO ═══ */}
        <div ref={heroRef}>
          <motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
            <HeroScene />
          </motion.div>
        </div>

        {/* ═══ STATS BAR ═══ */}
        <section className="relative z-10 border-y border-white/5 bg-[#0A0A0A]">
          <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-8">
              <div className="text-center">
                <FlipCounter
                  value={45}
                  suffix="L+"
                  className="justify-center font-[var(--font-space-grotesk)] text-4xl font-bold text-amber-400 sm:text-5xl"
                />
                <p className="mt-2 text-xs sm:text-sm text-[#737373]">
                  houses built yearly
                </p>
              </div>
              <ZeroStat label="apps for homeowners" />
              <div className="text-center">
                <FlipCounter
                  value={72}
                  suffix="%"
                  className="justify-center font-[var(--font-space-grotesk)] text-4xl font-bold text-amber-400 sm:text-5xl"
                />
                <p className="mt-2 text-xs sm:text-sm text-[#737373]">
                  over budget
                </p>
              </div>
              <div className="text-center">
                <FlipCounter
                  value={18}
                  suffix="+"
                  className="justify-center font-[var(--font-space-grotesk)] text-4xl font-bold text-amber-400 sm:text-5xl"
                />
                <p className="mt-2 text-xs sm:text-sm text-[#737373]">
                  months of chaos
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 2 — THE PROBLEM ═══ */}
        <section id="problem" className="section-glow-divider relative z-10 py-28 sm:py-36">
          <div className="relative mx-auto max-w-4xl px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.p
                initial={reduced ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-sm font-medium uppercase tracking-widest text-amber-500"
              >
                The problem
              </motion.p>
              <TextReveal
                mode="clipReveal"
                split="word"
                stagger={0.08}
                className="mt-4 font-[var(--font-space-grotesk)] text-3xl font-bold text-white sm:text-5xl lg:text-6xl"
                as="h2"
              >
                Building a house in India is beautiful chaos.
              </TextReveal>
            </motion.div>

            <div className="mt-16 space-y-8 sm:mt-20 sm:space-y-12">
              {painPoints.map((point, i) => (
                <motion.div
                  key={i}
                  initial={
                    reduced
                      ? {}
                      : {
                          opacity: 0,
                          x: point.side === "left" ? -60 : 60,
                          rotateZ: point.side === "left" ? -3 : 3,
                        }
                  }
                  whileInView={{ opacity: 1, x: 0, rotateZ: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                    delay: i * 0.05,
                  }}
                  className={`pain-card relative max-w-lg ${
                    point.side === "right" ? "ml-auto" : ""
                  }`}
                >
                  <div className="glass-card rounded-2xl p-6 sm:p-8">
                    <p className="font-[var(--font-space-grotesk)] text-lg font-semibold leading-snug text-white sm:text-xl">
                      {point.quote}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[#737373]">
                      {point.detail}
                    </p>
                  </div>
                  <div
                    className={`accent-line absolute top-0 h-full ${
                      i % 2 === 0
                        ? "-left-4 w-px bg-red-500/30"
                        : "-right-4 w-px bg-amber-500/30"
                    } hidden sm:block`}
                  />
                  {/* Border line height animation */}
                  <motion.div
                    className={`absolute top-0 w-[2px] ${
                      i % 2 === 0
                        ? "-left-4 bg-red-500/50"
                        : "-right-4 bg-amber-500/50"
                    } hidden sm:block`}
                    initial={{ height: "0%" }}
                    whileInView={{ height: "100%" }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.1 + 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ BEFORE / AFTER COMPARISON ═══ */}
        <ComparisonTable />

        {/* ═══ SECTION 3 — THE TURN ═══ */}
        <section
          id="solution"
          className="section-glow-divider relative z-10 overflow-hidden py-28 sm:py-36"
        >
          <div className="relative mx-auto max-w-5xl px-6">
            <motion.div
              initial={reduced ? {} : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2 }}
              className="text-center"
            >
              <TextReveal
                mode="blur"
                split="word"
                stagger={0.3}
                className="font-[var(--font-space-grotesk)] text-3xl font-bold text-white sm:text-5xl lg:text-6xl"
                as="h2"
              >
                What if every rupee had a name?
              </TextReveal>
              <p className="mx-auto mt-4 max-w-md text-lg text-[#525252]">
                Every brick had a purpose?
              </p>
            </motion.div>

            {/* Three phones — fan out from stacked center */}
            <div className="mt-20 grid grid-cols-1 items-end gap-10 sm:mt-24 sm:grid-cols-3 sm:gap-8">
              {[
                { Screen: DailyLogScreen, label: "Daily Log", delay: 0 },
                { Screen: BudgetScreen, label: "Budget", delay: 0.15 },
                {
                  Screen: MaterialTrackerScreen,
                  label: "Materials",
                  delay: 0.3,
                },
              ].map((phone, i) => (
                <TiltPhone
                  key={phone.label}
                  label={phone.label}
                  delay={phone.delay}
                >
                  <phone.Screen />
                </TiltPhone>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS — Quick 3 Steps ═══ */}
        <section
          id="features"
          className="section-glow-divider relative z-10 border-t border-white/5 py-24 sm:py-32"
        >
          <div className="mx-auto max-w-5xl px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="text-center"
            >
              <motion.p
                initial={reduced ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-sm font-medium uppercase tracking-widest text-teal-400"
              >
                How it works
              </motion.p>
              <TextReveal
                mode="fadeUp"
                split="word"
                stagger={0.08}
                className="mt-4 font-[var(--font-space-grotesk)] text-3xl font-bold text-white sm:text-5xl"
                as="h2"
              >
                30 seconds a day. Total control.
              </TextReveal>
            </motion.div>

            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:mt-20">
              {[
                {
                  step: "01",
                  icon: Camera,
                  title: "Snap & log",
                  desc: "Take a photo. Add what happened. Enter the cost. Done.",
                  color: "amber",
                },
                {
                  step: "02",
                  icon: Package,
                  title: "Track materials",
                  desc: "Cement, steel, bricks, sand. Know exactly what you have and what you need.",
                  color: "teal",
                },
                {
                  step: "03",
                  icon: IndianRupee,
                  title: "See everything",
                  desc: "Budget vs actual. By category. In real time. No surprises.",
                  color: "green",
                },
              ].map((item, i) => {
                const borderColor =
                  item.color === "amber"
                    ? "border-amber-500/20 hover:border-amber-500/40"
                    : item.color === "teal"
                      ? "border-teal-500/20 hover:border-teal-500/40"
                      : "border-green-500/20 hover:border-green-500/40";
                const iconColor =
                  item.color === "amber"
                    ? "text-amber-400"
                    : item.color === "teal"
                      ? "text-teal-400"
                      : "text-green-400";
                const numColor =
                  item.color === "amber"
                    ? "text-amber-500/20"
                    : item.color === "teal"
                      ? "text-teal-500/20"
                      : "text-green-500/20";

                return (
                  <motion.div
                    key={item.step}
                    initial={
                      reduced
                        ? {}
                        : { opacity: 0, y: 60, scale: 0.95 }
                    }
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.15,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`hiw-card animated-border group relative overflow-hidden rounded-2xl border ${borderColor} bg-[#111] p-7 transition-all duration-300 hover:bg-[#141414]`}
                  >
                    {/* Background step number */}
                    <span
                      className={`step-number absolute -right-2 -top-4 font-[var(--font-space-grotesk)] text-[120px] font-bold leading-none ${numColor}`}
                    >
                      {item.step}
                    </span>
                    <div className="relative">
                      <div
                        className={`icon-ring mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10`}
                      >
                        <item.icon className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <h3 className="font-[var(--font-space-grotesk)] text-lg font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#737373]">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 4 — FEATURES DEEP DIVE ═══ */}
        {featureDeepDives.map((feature, idx) => {
          const accentColors = {
            amber: {
              label: "text-amber-500",
              gradient: "from-amber-400 to-amber-600",
            },
            teal: {
              label: "text-teal-400",
              gradient: "from-teal-400 to-teal-600",
            },
            green: {
              label: "text-green-400",
              gradient: "from-green-400 to-green-600",
            },
          };
          const colors =
            accentColors[feature.accent as keyof typeof accentColors];
          const isEven = idx % 2 === 0;

          return (
            <section
              key={feature.label}
              className="relative z-10 border-t border-white/5 py-24 sm:py-32"
            >
              <div className="relative mx-auto max-w-6xl px-6">
                <div
                  className={`flex flex-col items-center gap-12 lg:flex-row lg:gap-20 ${
                    isEven ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  <TiltPhone swingIn delay={0}>
                    <feature.Screen />
                  </TiltPhone>

                  <motion.div
                    initial={reduced ? {} : { opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                      duration: 0.7,
                      delay: 0.15,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="max-w-lg"
                  >
                    <p
                      className={`text-sm font-medium uppercase tracking-widest ${colors.label}`}
                    >
                      {feature.label}
                    </p>
                    <h3 className="mt-4 font-[var(--font-space-grotesk)] text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                      {feature.title}
                    </h3>
                    <p
                      className={`mt-2 font-[var(--font-space-grotesk)] text-lg font-semibold gradient-text-animated`}
                    >
                      {feature.subtitle}
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-[#737373]">
                      {feature.detail}
                    </p>
                  </motion.div>
                </div>
              </div>
            </section>
          );
        })}

        {/* ═══ SECTION 5 — TRUST ═══ */}
        <section className="relative z-10 border-t border-white/5 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <TextReveal
                mode="fadeUp"
                split="word"
                stagger={0.1}
                className="font-[var(--font-space-grotesk)] text-3xl font-bold text-white sm:text-4xl"
                as="h2"
              >
                Your home. Your data.
              </TextReveal>
              <motion.p
                initial={reduced ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto mt-4 max-w-lg text-base text-[#737373]"
              >
                We built Punadi for families like ours. Your data stays on your
                phone. No cloud. No account required. Because some things are
                nobody else&apos;s business.
              </motion.p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                {[
                  { Icon: Lock, text: "Data stays on device" },
                  { Icon: WifiOff, text: "Works offline" },
                  { Icon: Globe, text: "Telugu, Hindi, English" },
                ].map((badge, i) => (
                  <motion.div
                    key={badge.text}
                    initial={reduced ? {} : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 150,
                      damping: 20,
                      delay: i * 0.1 + 0.3,
                    }}
                    className="trust-badge flex items-center gap-2.5 rounded-xl border border-white/5 bg-[#111] px-5 py-3"
                  >
                    <badge.Icon className="h-4 w-4 text-teal-400" />
                    <span className="text-sm text-[#A3A3A3]">
                      {badge.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ SECTION 6 — TIMELINE ═══ */}
        <section
          id="timeline"
          className="relative z-10 border-t border-white/5 py-24 sm:py-32"
        >
          <div className="relative mx-auto max-w-4xl px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="mb-16 text-center sm:mb-20"
            >
              <motion.p
                initial={reduced ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-sm font-medium uppercase tracking-widest text-amber-500"
              >
                The journey
              </motion.p>
              <TextReveal
                mode="fadeUp"
                split="word"
                stagger={0.1}
                className="mt-4 font-[var(--font-space-grotesk)] text-3xl font-bold text-white sm:text-5xl"
                as="h2"
              >
                From foundation to finish.
              </TextReveal>
              <motion.p
                initial={reduced ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto mt-4 max-w-md text-base text-[#737373]"
              >
                Every construction phase, tracked. Every milestone, celebrated.
              </motion.p>
            </motion.div>

            <ConstructionTimeline />
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <FAQ />

        {/* ═══ SECTION 7 — CTA ═══ */}
        <motion.section
          id="waitlist"
          className="relative z-10 border-t border-white/5 py-24 sm:py-32"
          initial={reduced ? {} : { scale: 0.92 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Warm ambient glow */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/[0.03] to-transparent" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.02] blur-[120px]" />
          </motion.div>

          <div className="relative mx-auto max-w-xl px-6 text-center">
            {/* Telugu typewriter badge */}
            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5"
            >
              <span className="font-[var(--font-anek-telugu)] text-xs font-medium text-amber-400 telugu-typewriter">
                {"\u0C2A\u0C41\u0C28\u0C3E\u0C26\u0C3F"}
              </span>
            </motion.div>

            <TextReveal
              mode="fadeUp"
              split="word"
              stagger={0.1}
              className="font-[var(--font-space-grotesk)] text-3xl font-bold text-white sm:text-5xl"
              as="h2"
            >
              Start your foundation.
            </TextReveal>

            <motion.p
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-4 text-lg text-[#737373]"
            >
              Join the waitlist. Get early access when Punadi launches in
              India.
            </motion.p>

            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10"
            >
              {/* Social proof counter */}
              <WaitlistCounter />

              {submitted ? (
                <div className="relative rounded-2xl border border-teal-500/20 bg-teal-500/5 p-8 overflow-hidden">
                  <Confetti trigger={submitted} />
                  <p className="text-xl font-medium text-teal-300">
                    You&apos;re in. We&apos;ll reach out when Punadi is ready.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="cta-input flex-1 rounded-full border border-white/10 bg-[#111111] px-6 py-4 text-base text-white placeholder-[#525252] outline-none ring-1 ring-transparent transition-all focus:border-amber-500/50 focus:ring-amber-500/20"
                  />
                  <MagneticButton strength={6}>
                    <button
                      type="submit"
                      data-cursor="cta"
                      className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-600/40"
                    >
                      Join Waitlist
                    </button>
                  </MagneticButton>
                </form>
              )}
            </motion.div>

            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 flex items-center justify-center gap-2 text-sm text-[#525252]"
            >
              <Smartphone className="h-4 w-4" />
              <span>Android &amp; iOS &mdash; Coming 2026</span>
            </motion.div>
          </div>
        </motion.section>

        {/* ═══ FOOTER ═══ */}
        <footer className="relative z-10 border-t border-white/5 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {/* Col 1 — Brand */}
              <div>
                <div className="flex items-center">
                  <span className="font-[var(--font-space-grotesk)] text-xl font-bold tracking-tight text-white">
                    punadi
                  </span>
                  <span className="ml-1 font-[var(--font-space-grotesk)] text-xl font-bold tracking-tight text-amber-500">
                    .
                  </span>
                </div>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#525252]">
                  Every rupee. Every brick. Track your house construction with
                  clarity and confidence.
                </p>
              </div>

              {/* Col 2 — Quick links */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#525252]">
                  Explore
                </h4>
                <ul className="mt-4 space-y-3">
                  {[
                    { label: "Problem", href: "#problem" },
                    { label: "Solution", href: "#solution" },
                    { label: "Features", href: "#features" },
                    { label: "Timeline", href: "#timeline" },
                    { label: "Join Waitlist", href: "#waitlist" },
                  ].map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="nav-link-hover relative text-sm text-[#737373] transition-colors hover:text-amber-400"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3 — Social */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#525252]">
                  Follow us
                </h4>
                <ul className="mt-4 space-y-3">
                  {[
                    {
                      label: "Instagram",
                      href: "https://instagram.com/punadi.app",
                    },
                    { label: "Twitter / X", href: "https://x.com/punadi_app" },
                    {
                      label: "LinkedIn",
                      href: "https://linkedin.com/company/punadiapp",
                    },
                  ].map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link-hover relative text-sm text-[#737373] transition-colors hover:text-amber-400"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-12 border-t border-white/5 pt-6 text-center text-xs text-[#333]">
              &copy; {new Date().getFullYear()} Punadi. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}
