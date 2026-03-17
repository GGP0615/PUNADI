"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import { AssemblingHouse } from "./AssemblingHouse";
import { GPUParticles } from "./GPUParticles";
import { GradientMesh } from "./GradientMesh";
import { getDeviceTier } from "@/lib/deviceTier";

function CameraRig() {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.1) * 0.3;
    camera.position.y = 3 + Math.sin(t * 0.15) * 0.2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function SmartDirectionalLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    if (!lightRef.current) return;
    const now = new Date();
    const istHour = (now.getUTCHours() + 5 + (now.getUTCMinutes() + 30 >= 60 ? 1 : 0)) % 24;

    if (istHour >= 6 && istHour < 9) {
      lightRef.current.color.set("#FFF8E8");
      lightRef.current.intensity = 1.4;
    } else if (istHour >= 18 && istHour < 21) {
      lightRef.current.color.set("#FFD4A0");
      lightRef.current.intensity = 1.0;
    } else if (istHour >= 21 || istHour < 6) {
      lightRef.current.color.set("#E0E8FF");
      lightRef.current.intensity = 0.8;
    }
  }, []);

  return (
    <directionalLight
      ref={lightRef}
      position={[5, 8, 5]}
      intensity={1.2}
      castShadow
      shadow-mapSize={[1024, 1024]}
      color="#FFF5E6"
    />
  );
}

function SceneContent() {
  const [tier, setTier] = useState<"high" | "medium" | "low">("medium");
  // Stagger heavy loads: particles + post-processing come in after physics settles
  const [showExtras, setShowExtras] = useState(false);

  useEffect(() => {
    setTier(getDeviceTier());
    // Let physics initialize and first paint happen, then add particles + effects
    const timer = setTimeout(() => setShowExtras(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const materialCount = tier === "low" ? 30 : 50;
  const particleCount = tier === "high" ? 400 : tier === "medium" ? 200 : 80;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <SmartDirectionalLight />
      <pointLight position={[-3, 4, -3]} intensity={0.5} color="#C17817" />
      <pointLight position={[3, 2, 3]} intensity={0.3} color="#1A6B6A" />

      {/* Camera rig */}
      <CameraRig />

      {/* Physics-based falling materials — loads immediately */}
      <Physics gravity={[0, -9.81, 0]}>
        <AssemblingHouse count={materialCount} />
      </Physics>

      {/* These load after physics is running to prevent jank */}
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
        camera={{ position: [0, 3, 10], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "#0A0A0A" }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>

      {/* CSS Vignette + subtle bloom glow (replaces postprocessing) */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          boxShadow: "inset 0 0 150px 60px rgba(0,0,0,0.7)",
        }}
      />

      {/* HTML Overlay */}
      <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center">
        <div
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: "3s", animationFillMode: "forwards" }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-medium text-amber-400 telugu-typewriter">
              పునాది — Foundation
            </span>
          </div>
        </div>

        <h1
          className="animate-fade-in-up font-[var(--font-space-grotesk)] text-6xl font-bold tracking-tight text-white opacity-0 sm:text-7xl lg:text-8xl"
          style={{ animationDelay: "3.3s", animationFillMode: "forwards" }}
        >
          <span className="block">Every rupee.</span>
          <span className="block gradient-text-animated">
            Every brick.
          </span>
        </h1>

        <p
          className="animate-fade-in-up mt-6 max-w-lg px-6 text-center text-lg text-[#A3A3A3] opacity-0"
          style={{ animationDelay: "3.6s", animationFillMode: "forwards" }}
        >
          Track your house construction. Every expense. Every material. Every
          day.
        </p>

        <div
          className="animate-fade-in-up pointer-events-auto mt-8 flex gap-4 opacity-0"
          style={{ animationDelay: "3.9s", animationFillMode: "forwards" }}
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
          style={{ animationDelay: "4.5s", animationFillMode: "forwards" }}
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
