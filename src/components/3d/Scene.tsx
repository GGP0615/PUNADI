"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BlueprintFloorplan } from "./BlueprintFloorplan";
import { GPUParticles } from "./GPUParticles";
import { GradientMesh } from "./GradientMesh";
import { getDeviceTier } from "@/lib/deviceTier";
import { ChaosWall } from "@/components/ChaosWall";

function CameraRig() {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.08) * 0.5;
    camera.position.y = Math.sin(t * 0.06) * 0.3;
    camera.position.z = 8 + Math.sin(t * 0.05) * 0.3;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function SceneContent() {
  const [tier, setTier] = useState<"high" | "medium" | "low">("medium");
  const [showExtras, setShowExtras] = useState(false);

  useEffect(() => {
    setTier(getDeviceTier());
    const timer = setTimeout(() => setShowExtras(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const particleCount = tier === "high" ? 600 : tier === "medium" ? 300 : 120;

  return (
    <>
      <ambientLight intensity={0.25} color="#FFF8F0" />
      <directionalLight position={[6, 6, 4]} intensity={1.2} color="#FFE4C0" castShadow />
      <directionalLight position={[-5, 3, 2]} intensity={0.4} color="#1A6B6A" />
      <pointLight position={[0, 2, -6]} intensity={0.6} color="#D4860A" />
      <pointLight position={[0, -4, 0]} intensity={0.2} color="#C17817" />
      <CameraRig />

      {/* Blueprint floor plan draws itself after wall reveal */}
      <BlueprintFloorplan />

      {showExtras && (
        <>
          <GradientMesh />
          <GPUParticles count={particleCount} />
        </>
      )}
    </>
  );
}

export function HeroScene() {
  const [mounted, setMounted] = useState(false);
  const [wallComplete, setWallComplete] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWallComplete = useCallback(() => {
    setWallComplete(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen w-full bg-[#0A0A0A] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      className="hero-spotlight relative h-screen w-full"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        e.currentTarget.style.setProperty("--spotlight-x", `${x}%`);
        e.currentTarget.style.setProperty("--spotlight-y", `${y}%`);
      }}
    >
      {/* 3D Canvas — emerges from the crack with slow scale + fade */}
      <div
        className={`absolute inset-0 ${wallComplete ? "hero-scene-emerge" : ""}`}
        style={{ opacity: wallComplete ? undefined : 0 }}
      >
        <Canvas
          shadows
          camera={{ position: [0, 0, 8], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
          style={{ background: "#0A0A0A" }}
        >
          <Suspense fallback={null}>
            <SceneContent />
          </Suspense>
        </Canvas>
      </div>

      {/* Chaos Wall */}
      <ChaosWall onComplete={handleWallComplete} />

      {/* Warm afterglow — residual light from the crack that settles into ambient warmth */}
      {wallComplete && (
        <div className="absolute inset-0 z-[2] pointer-events-none hero-afterglow" />
      )}

      {/* Soft vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{ boxShadow: "inset 0 0 200px 80px rgba(0,0,0,0.6)" }}
      />

      {/* ─── Hero text overlay ─── */}
      <div className="pointer-events-none absolute inset-0 z-[4] flex flex-col items-center justify-center">

        {/* Telugu badge */}
        <div
          className={`opacity-0 ${wallComplete ? "hero-text-reveal" : "invisible"}`}
          style={{ animationDelay: wallComplete ? "0.4s" : "99s" }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 backdrop-blur-md">
            <span className="text-xs font-medium text-amber-400 telugu-typewriter">
              పునాది — Foundation
            </span>
          </div>
        </div>

        {/* Main headline — each line is its own reveal beat */}
        <h1 className="font-[var(--font-space-grotesk)] text-center">
          <span
            className={`block text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white opacity-0 drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] ${wallComplete ? "hero-text-reveal" : "invisible"}`}
            style={{ animationDelay: wallComplete ? "0.7s" : "99s" }}
          >
            Every rupee.
          </span>
          <span
            className={`block text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight opacity-0 drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] ${wallComplete ? "hero-text-reveal" : "invisible"}`}
            style={{ animationDelay: wallComplete ? "1.0s" : "99s" }}
          >
            {/* Light sweep container */}
            <span className="hero-gradient-text-wrap relative inline-block">
              <span className="gradient-text-animated">Every brick.</span>
              {wallComplete && <span className="hero-light-sweep" />}
            </span>
          </span>

          {/* "No more chaos." — the punchline, connects back to the wall */}
          <span
            className={`block text-2xl sm:text-3xl lg:text-4xl mt-3 font-normal opacity-0 ${wallComplete ? "hero-punchline-reveal" : "invisible"}`}
            style={{ animationDelay: wallComplete ? "1.6s" : "99s" }}
          >
            <span className="etched-text text-white/50">No more chaos.</span>
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-6 max-w-lg px-6 text-center text-lg text-[#A3A3A3] opacity-0 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] ${wallComplete ? "hero-text-reveal" : "invisible"}`}
          style={{ animationDelay: wallComplete ? "2.0s" : "99s" }}
        >
          Track your house construction. Every expense. Every material. Every
          day.
        </p>

        {/* CTA */}
        <div
          className={`pointer-events-auto mt-8 flex gap-4 opacity-0 ${wallComplete ? "hero-text-reveal" : "invisible"}`}
          style={{ animationDelay: wallComplete ? "2.4s" : "99s" }}
        >
          <a
            href="#waitlist"
            data-cursor="cta"
            className="cta-glow group flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-base font-semibold text-white transition-all hover:scale-105"
          >
            Join the Waitlist
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 opacity-0 ${wallComplete ? "hero-text-reveal" : "invisible"}`}
          style={{ animationDelay: wallComplete ? "3.0s" : "99s" }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-[#525252]">Scroll to explore</span>
            <div className="h-10 w-6 rounded-full border-2 border-white/10 p-1">
              <div className="h-2 w-full animate-bounce rounded-full bg-amber-500/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
