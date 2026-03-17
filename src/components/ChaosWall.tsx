"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Phase = "building" | "tension" | "cracking" | "revealed" | "done";

interface ChaosSnippet {
  id: number;
  lines: { text: string; className?: string }[];
  /** correction appears after initial text, crossed out + replaced */
  correction?: { original: string; replacement: string };
  x: number;
  y: number;
  rotate: number;
  size: "sm" | "md" | "lg";
  opacity: number;
  /** absolute delay from t=0 in ms */
  delay: number;
  wave: 1 | 2 | 3;
}

// ── Snippet content ──
// Wave 1 (0–1s): Background noise — small, dim, sets the scribbled notebook feel
// Wave 2 (0.8–2s): Secondary — wall getting busy
// Wave 3 (1.8–3s): Primary gut-punches — the lines that make you go "that's me"

const SNIPPETS: ChaosSnippet[] = [
  // ─── Wave 1: Background noise (small, low opacity, appear first) ───
  {
    id: 9, wave: 1,
    lines: [{ text: "4500 + 3200 + 1800 = ?" }],
    x: 76, y: 20, rotate: -4.2, size: "sm", opacity: 0.3, delay: 100,
  },
  {
    id: 11, wave: 1,
    lines: [{ text: "call Ramesh for bricks" }],
    x: 15, y: 30, rotate: -2.8, size: "sm", opacity: 0.25, delay: 300,
  },
  {
    id: 10, wave: 1,
    lines: [{ text: '₹50,000 "miscellaneous"' }],
    x: 6, y: 72, rotate: 1.5, size: "sm", opacity: 0.25, delay: 500,
  },
  {
    id: 12, wave: 1,
    lines: [
      { text: "budget: 24L  " },
      { text: "actual: ???", className: "text-red-400/50" },
    ],
    x: 60, y: 85, rotate: 3.5, size: "sm", opacity: 0.3, delay: 700,
  },
  {
    id: 13, wave: 1,
    lines: [{ text: "wiring — ask Suresh" }],
    x: 72, y: 50, rotate: -1.5, size: "sm", opacity: 0.2, delay: 400,
  },
  {
    id: 14, wave: 1,
    lines: [{ text: "plumber ₹200/hr ??" }],
    x: 40, y: 10, rotate: 2.2, size: "sm", opacity: 0.25, delay: 600,
  },

  // ─── Wave 2: Secondary (medium, fill the wall) ───
  {
    id: 5, wave: 2,
    lines: [
      { text: "mistry - ₹800/day × 14" },
    ],
    correction: { original: "14 days", replacement: "actually 18 days" },
    x: 8, y: 42, rotate: -3.8, size: "md", opacity: 0.55, delay: 1000,
  },
  {
    id: 6, wave: 2,
    lines: [{ text: "paid cash — no receipt" }],
    x: 62, y: 36, rotate: 2.1, size: "md", opacity: 0.5, delay: 1300,
  },
  {
    id: 7, wave: 2,
    lines: [
      { text: "sand - 2 loads ✓  " },
      { text: "steel - ???", className: "text-amber-400/60" },
    ],
    x: 30, y: 75, rotate: -0.8, size: "md", opacity: 0.55, delay: 1500,
  },
  {
    id: 8, wave: 2,
    lines: [
      { text: "electrician: 2 days..." },
    ],
    correction: { original: "2 days", replacement: "week 3 now" },
    x: 68, y: 72, rotate: 4.5, size: "md", opacity: 0.5, delay: 1700,
  },
  {
    id: 15, wave: 2,
    lines: [{ text: "tiles — which shop??" }],
    x: 82, y: 60, rotate: -3.0, size: "sm", opacity: 0.35, delay: 1200,
  },

  // ─── Wave 3: Primary gut-punches (large, appear last with weight) ───
  {
    id: 1, wave: 3,
    lines: [
      { text: "₹4,500", className: "chaos-strikethrough" },
      { text: "  ₹5,400?", className: "text-red-400/80" },
    ],
    x: 12, y: 18, rotate: -2.5, size: "lg", opacity: 0.85, delay: 2000,
  },
  {
    id: 2, wave: 3,
    lines: [
      { text: "cement: 200 bags" },
      { text: " → ordered 280 ????", className: "text-amber-400/70" },
    ],
    x: 48, y: 14, rotate: 1.8, size: "lg", opacity: 0.8, delay: 2300,
  },
  {
    id: 3, wave: 3,
    lines: [
      { text: "TOTAL: " },
      { text: "₹18,40,000", className: "chaos-strikethrough" },
      { text: " ₹22,10,000", className: "chaos-strikethrough" },
      { text: " ₹??", className: "text-red-400/90 text-2xl md:text-3xl" },
    ],
    x: 18, y: 53, rotate: -1.2, size: "lg", opacity: 0.9, delay: 2600,
  },
  {
    id: 4, wave: 3,
    lines: [{ text: 'Amma: "kitna hua aaj?"', className: "italic" }],
    x: 50, y: 60, rotate: 3.2, size: "lg", opacity: 0.75, delay: 2900,
  },
];

const MOBILE_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 9, 12]);

// Precompute dust particles to avoid random-on-render issues
const DUST_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: 47 + Math.random() * 6,
  top: 10 + Math.random() * 80,
  dx: (Math.random() - 0.5) * 200,
  dy: (Math.random() - 0.5) * 140,
  delay: Math.random() * 300,
  duration: 600 + Math.random() * 500,
  size: 2 + Math.random() * 4,
}));

interface ChaosWallProps {
  onComplete: () => void;
}

export function ChaosWall({ onComplete }: ChaosWallProps) {
  const [phase, setPhase] = useState<Phase>("building");
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showCorrections, setShowCorrections] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const completeCalled = useRef(false);

  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Skip entirely for reduced motion
  useEffect(() => {
    if (prefersReducedMotion) {
      onComplete();
      setPhase("done");
    }
  }, [prefersReducedMotion, onComplete]);

  // ── Phase timeline ──
  // Desktop: building(0) → tension(3000) → cracking(5000) → revealed(6200) → done(7400)
  // Mobile:  building(0) → tension(2200) → cracking(3800) → revealed(4700) → done(5600)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const mobile = window.innerWidth < 768;
    const t = mobile
      ? { tension: 2200, corrections: 2600, cracking: 3800, revealed: 4700, done: 5600 }
      : { tension: 3000, corrections: 3600, cracking: 5000, revealed: 6200, done: 7400 };

    const timers = [
      setTimeout(() => setPhase("tension"), t.tension),
      setTimeout(() => setShowCorrections(true), t.corrections),
      setTimeout(() => setPhase("cracking"), t.cracking),
      setTimeout(() => {
        setPhase("revealed");
        if (!completeCalled.current) {
          completeCalled.current = true;
          onComplete();
        }
      }, t.revealed),
      setTimeout(() => setPhase("done"), t.done),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete, prefersReducedMotion]);

  // Mouse parallax on wall
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2, // -1 to 1
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      });
    },
    [isMobile]
  );

  // Skip handler
  const handleSkip = useCallback(() => {
    if (!completeCalled.current) {
      completeCalled.current = true;
      onComplete();
    }
    setPhase("done");
  }, [onComplete]);

  if (phase === "done") return null;

  const snippets = isMobile
    ? SNIPPETS.filter((s) => MOBILE_IDS.has(s.id))
    : SNIPPETS;

  const sizeClass = {
    sm: "text-xs md:text-sm",
    md: "text-sm md:text-lg",
    lg: "text-lg md:text-2xl font-semibold",
  };

  const isExiting = phase === "cracking" || phase === "revealed";

  return (
    <div
      ref={containerRef}
      className={`chaos-wall absolute inset-0 z-10 overflow-hidden ${
        phase === "cracking" || phase === "revealed" ? "chaos-wall-shake" : ""
      }`}
      aria-hidden="true"
      onMouseMove={handleMouseMove}
    >
      {/* White flash on crack */}
      {phase === "cracking" && (
        <div className="chaos-flash absolute inset-0 z-50 pointer-events-none" />
      )}

      {/* Tension edge pulse — starts subtle, intensifies */}
      {(phase === "tension" || phase === "cracking") && (
        <div
          className={`absolute inset-0 pointer-events-none z-30 ${
            phase === "tension"
              ? "chaos-tension-pulse"
              : "chaos-tension-pulse-intense"
          }`}
        />
      )}

      {/* Notebook ruled lines — faint horizontal rules */}
      <div className="absolute inset-0 pointer-events-none chaos-notebook-lines" />

      {/* Crack line (SVG) */}
      {(phase === "tension" || isExiting) && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          {/* Main crack — jagged path instead of straight line */}
          {phase === "tension" ? (
            <path
              d="M500,0 L498,200 L502,400 L499,600 L501,800 L500,1000"
              fill="none"
              stroke="rgba(255,200,100,0.4)"
              strokeWidth="0.8"
              className="wall-crack-hairline"
            />
          ) : (
            <>
              <path
                d="M500,0 L495,150 L505,300 L492,450 L508,600 L496,750 L503,1000"
                fill="none"
                stroke="rgba(255,200,100,0.8)"
                strokeWidth="3"
                className="wall-crack-open"
              />
              {/* Branch cracks — more of them, varied angles */}
              <line x1="498" y1="200" x2="420" y2="140" stroke="rgba(255,200,100,0.5)" strokeWidth="1.5" className="wall-crack-branch" style={{ animationDelay: "0ms" }} />
              <line x1="502" y1="350" x2="570" y2="280" stroke="rgba(255,200,100,0.4)" strokeWidth="1" className="wall-crack-branch" style={{ animationDelay: "50ms" }} />
              <line x1="495" y1="500" x2="410" y2="530" stroke="rgba(255,200,100,0.5)" strokeWidth="1.5" className="wall-crack-branch" style={{ animationDelay: "100ms" }} />
              <line x1="505" y1="650" x2="590" y2="700" stroke="rgba(255,200,100,0.4)" strokeWidth="1" className="wall-crack-branch" style={{ animationDelay: "150ms" }} />
              <line x1="500" y1="800" x2="440" y2="860" stroke="rgba(255,200,100,0.3)" strokeWidth="1" className="wall-crack-branch" style={{ animationDelay: "200ms" }} />
              <line x1="496" y1="450" x2="560" y2="480" stroke="rgba(255,200,100,0.3)" strokeWidth="1" className="wall-crack-branch" style={{ animationDelay: "80ms" }} />
            </>
          )}
        </svg>
      )}

      {/* LEFT WALL HALF */}
      <div
        className={`absolute inset-0 ${isExiting ? "wall-fragment-left" : ""}`}
        style={{
          clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
          transform: !isExiting
            ? `translate(${mousePos.x * -3}px, ${mousePos.y * -2}px)`
            : undefined,
          transition: !isExiting ? "transform 0.3s ease-out" : undefined,
        }}
      >
        <div className="concrete-wall absolute inset-0" />
        {snippets
          .filter((s) => s.x < 50)
          .map((snippet) => (
            <ChaosText
              key={snippet.id}
              snippet={snippet}
              phase={phase}
              sizeClass={sizeClass[snippet.size]}
              mousePos={mousePos}
              showCorrection={showCorrections}
            />
          ))}
      </div>

      {/* RIGHT WALL HALF */}
      <div
        className={`absolute inset-0 ${isExiting ? "wall-fragment-right" : ""}`}
        style={{
          clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
          transform: !isExiting
            ? `translate(${mousePos.x * -3}px, ${mousePos.y * -2}px)`
            : undefined,
          transition: !isExiting ? "transform 0.3s ease-out" : undefined,
        }}
      >
        <div className="concrete-wall absolute inset-0" />
        {snippets
          .filter((s) => s.x >= 50)
          .map((snippet) => (
            <ChaosText
              key={snippet.id}
              snippet={snippet}
              phase={phase}
              sizeClass={sizeClass[snippet.size]}
              mousePos={mousePos}
              showCorrection={showCorrections}
            />
          ))}
      </div>

      {/* Light bleed through crack */}
      {isExiting && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-25">
          <div className="chaos-light-bleed" />
        </div>
      )}

      {/* Dust particles on crack */}
      {isExiting && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {DUST_PARTICLES.map((p) => (
            <div
              key={p.id}
              className="dust-particle"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                // @ts-expect-error CSS custom properties
                "--dust-dx": `${p.dx}px`,
                "--dust-dy": `${p.dy}px`,
                "--dust-delay": `${p.delay}ms`,
                "--dust-duration": `${p.duration}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-6 right-6 z-40 text-xs text-white/25 hover:text-white/50 transition-colors duration-300 flex items-center gap-1"
      >
        Skip
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 7l5 5-5 5M6 7l5 5-5 5" />
        </svg>
      </button>
    </div>
  );
}

function ChaosText({
  snippet,
  phase,
  sizeClass,
  mousePos,
  showCorrection,
}: {
  snippet: ChaosSnippet;
  phase: Phase;
  sizeClass: string;
  mousePos: { x: number; y: number };
  showCorrection: boolean;
}) {
  // Parallax: deeper snippets (background) move more
  const parallaxStrength = snippet.wave === 1 ? 8 : snippet.wave === 2 ? 5 : 3;
  const isExiting = phase === "cracking" || phase === "revealed";

  return (
    <span
      className={`absolute font-[var(--font-space-grotesk)] text-white/80 whitespace-nowrap
        chaos-text-etch ${sizeClass}
        ${phase === "tension" ? "number-jitter" : ""}
      `}
      style={{
        left: `${snippet.x}%`,
        top: `${snippet.y}%`,
        transform: !isExiting
          ? `rotate(${snippet.rotate}deg) translate(${mousePos.x * parallaxStrength}px, ${mousePos.y * parallaxStrength}px)`
          : `rotate(${snippet.rotate}deg)`,
        opacity: 0,
        animationDelay: `${snippet.delay}ms`,
        animationDuration: snippet.wave === 3 ? "1s" : "0.8s",
        transition: !isExiting ? "transform 0.3s ease-out" : undefined,
      }}
    >
      {snippet.lines.map((line, i) => (
        <span key={i} className={line.className}>
          {line.text}
        </span>
      ))}

      {/* Correction: appears during tension phase — crosses out and rewrites */}
      {snippet.correction && showCorrection && (
        <span className="chaos-correction-appear block text-red-400/70 text-sm mt-0.5">
          → {snippet.correction.replacement}
        </span>
      )}
    </span>
  );
}
