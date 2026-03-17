"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";

const vertexShader = `
  uniform float uTime;
  uniform float uScroll;
  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    float t = uTime;
    float speed = aSpeed;
    float phase = aPhase;

    // Organic drift
    pos.x += sin(t * speed * 0.5 + phase) * 2.0;
    pos.y += cos(t * speed * 0.3 + phase * 1.3) * 1.5;
    pos.z += sin(t * speed * 0.4 + phase * 0.7) * 1.0;

    // Scroll-driven convergence toward center at CTA (scroll > 0.85)
    float converge = smoothstep(0.85, 1.0, uScroll);
    pos = mix(pos, vec3(0.0, 1.0, 0.0), converge * 0.4);

    // Scroll-driven acceleration during problem section (0.2-0.4)
    float accel = smoothstep(0.2, 0.3, uScroll) * (1.0 - smoothstep(0.35, 0.45, uScroll));
    pos.y += sin(t * 3.0 + phase) * accel * 2.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (30.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // Distance-based fade
    vAlpha = smoothstep(0.0, 0.5, aSize / 8.0) * (1.0 - smoothstep(20.0, 40.0, -mvPosition.z));
  }
`;

const fragmentShader = `
  varying float vAlpha;
  uniform vec3 uColor;

  void main() {
    // Soft circle
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.2, dist) * vAlpha * 0.12;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function GPUParticles({ count = 1500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, sizes, speeds, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const sp = new Float32Array(count);
    const ph = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      sz[i] = 0.5 + Math.random() * 2;
      sp[i] = 0.1 + Math.random() * 0.4;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, sizes: sz, speeds: sp, phases: ph };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uColor: { value: new THREE.Color("#C17817") },
    }),
    []
  );

  useFrame((state) => {
    if (!pointsRef.current) return;
    const mat = pointsRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = state.clock.getElapsedTime();
    mat.uniforms.uScroll.value = scrollProgress.get();
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
