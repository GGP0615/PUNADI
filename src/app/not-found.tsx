import Link from "next/link";
import { PunadiLogo } from "@/components/PunadiLogo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-6 text-center font-[var(--font-inter)]">
      {/* Construction tape SVG */}
      <svg
        className="mb-8 w-64 opacity-20"
        viewBox="0 0 300 20"
        fill="none"
      >
        <rect width="300" height="20" rx="2" fill="#C17817" />
        {Array.from({ length: 15 }, (_, i) => (
          <rect
            key={i}
            x={i * 40 - 10}
            y="0"
            width="20"
            height="28"
            fill="#0A0A0A"
            transform="rotate(-45 10 10)"
          />
        ))}
      </svg>

      <div className="mb-6 animate-bounce">
        <PunadiLogo className="h-16 w-16" />
      </div>

      <h1 className="font-[var(--font-space-grotesk)] text-6xl font-bold text-white">
        404
      </h1>
      <p className="mt-4 text-lg text-[#737373]">
        This page is still under construction.
      </p>
      <p className="mt-2 text-sm text-[#525252]">
        The foundation is laid, but this room isn&apos;t built yet.
      </p>

      <Link
        href="/"
        className="mt-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-600/40"
      >
        Back to Home
      </Link>

      {/* Hard hat floating */}
      <div className="absolute right-[15%] top-[20%] animate-pulse text-5xl opacity-30">
        &#x1F6E1;&#xFE0F;
      </div>
      <div className="absolute left-[10%] top-[30%] animate-bounce text-4xl opacity-20" style={{ animationDelay: "0.5s" }}>
        &#x1F9F1;
      </div>
    </div>
  );
}
