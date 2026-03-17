"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AssemblingHouse } from "./AssemblingHouse";
import { GPUParticles } from "./GPUParticles";
import { GradientMesh } from "./GradientMesh";
import { getDeviceTier } from "@/lib/deviceTier";

function CameraRig() {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Very slow, subtle orbital drift
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

  const shapeCount = tier === "low" ? 12 : 18;
  const particleCount = tier === "high" ? 600 : tier === "medium" ? 300 : 120;

  return (
    <>
      {/* Soft, atmospheric lighting */}
      <ambientLight intensity={0.25} color="#FFF8F0" />

      {/* Key light — warm amber from upper right */}
      <directionalLight
        position={[6, 6, 4]}
        intensity={1.2}
        color="#FFE4C0"
        castShadow
      />

      {/* Fill light — cool teal from left */}
      <directionalLight
        position={[-5, 3, 2]}
        intensity={0.4}
        color="#1A6B6A"
      />

      {/* Back rim light — creates edge glow */}
      <pointLight position={[0, 2, -6]} intensity={0.6} color="#D4860A" />

      {/* Bottom warm bounce */}
      <pointLight position={[0, -4, 0]} intensity={0.2} color="#C17817" />

      <CameraRig />

      {/* Abstract floating construction shapes */}
      <AssemblingHouse count={shapeCount} />

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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen w-full bg-[#0A0A0A] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
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

      {/* Soft vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          boxShadow: "inset 0 0 200px 80px rgba(0,0,0,0.6)",
        }}
      />

      {/* HTML Overlay */}
      <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center">
        <div
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 backdrop-blur-md">
            <span className="text-xs font-medium text-amber-400 telugu-typewriter">
              పునాది — Foundation
            </span>
          </div>
        </div>

        <h1
          className="animate-fade-in-up font-[var(--font-space-grotesk)] text-6xl font-bold tracking-tight text-white opacity-0 sm:text-7xl lg:text-8xl drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
          style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
        >
          <span className="block">Every rupee.</span>
          <span className="block gradient-text-animated">
            Every brick.
          </span>
        </h1>

        <p
          className="animate-fade-in-up mt-6 max-w-lg px-6 text-center text-lg text-[#A3A3A3] opacity-0 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
          style={{ animationDelay: "1.1s", animationFillMode: "forwards" }}
        >
          Track your house construction. Every expense. Every material. Every
          day.
        </p>

        <div
          className="animate-fade-in-up pointer-events-auto mt-8 flex gap-4 opacity-0"
          style={{ animationDelay: "1.4s", animationFillMode: "forwards" }}
        >
          <a
            href="#waitlist"
            data-cursor="cta"
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-600/40"
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
          className="animate-fade-in-up absolute bottom-8 opacity-0"
          style={{ animationDelay: "2s", animationFillMode: "forwards" }}
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
