"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";
import { getDeviceTier, type DeviceTier } from "@/lib/deviceTier";

export function PostProcessingStack() {
  const [tier, setTier] = useState<DeviceTier>("medium");
  const chromaRef = useRef<any>(null);

  useEffect(() => {
    setTier(getDeviceTier());
  }, []);

  useFrame(() => {
    // ChromaticAberration: subtle ramp during Problem section
    if (chromaRef.current?.offset) {
      const s = scrollProgress.get();
      const tension = Math.sin(
        Math.max(0, Math.min(1, (s - 0.15) / 0.2)) * Math.PI
      );
      const offset = 0.0003 + tension * 0.0015;
      chromaRef.current.offset.set(offset, offset);
    }
  });

  // Low tier: minimal
  if (tier === "low") {
    return (
      <EffectComposer>
        <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.9} intensity={0.3} />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    );
  }

  // Medium + High: Bloom + ChromAb + Noise + Vignette
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.9} intensity={0.35} />
      <ChromaticAberration
        ref={chromaRef}
        offset={new THREE.Vector2(0.0003, 0.0003)}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.15} />
      <Vignette offset={0.3} darkness={0.65} />
    </EffectComposer>
  );
}
