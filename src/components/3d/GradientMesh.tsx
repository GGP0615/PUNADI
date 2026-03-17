"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.999, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uScroll;
  uniform float uWallPhase;
  varying vec2 vUv;

  // Simplex noise helpers
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    float t = uTime * 0.15;

    // Noise-driven color fields
    float n1 = snoise(vUv * 2.0 + vec2(t, t * 0.7)) * 0.5 + 0.5;
    float n2 = snoise(vUv * 1.5 + vec2(-t * 0.5, t * 0.3)) * 0.5 + 0.5;
    float n3 = snoise(vUv * 3.0 + vec2(t * 0.3, -t * 0.6)) * 0.5 + 0.5;

    // Color journey mapped to scroll
    vec3 warm    = vec3(0.757, 0.471, 0.090);  // amber
    vec3 tension = vec3(0.6, 0.15, 0.1);        // red
    vec3 clarity = vec3(0.102, 0.420, 0.416);   // teal
    vec3 gold    = vec3(0.85, 0.55, 0.12);      // gold

    float s = uScroll;
    // During wall phase, shift toward tension red
    vec3 baseColor = mix(warm, tension, max(smoothstep(0.1, 0.3, s), uWallPhase * 0.6));
    baseColor = mix(baseColor, clarity, smoothstep(0.3, 0.55, s));
    baseColor = mix(baseColor, warm, smoothstep(0.55, 0.75, s));
    baseColor = mix(baseColor, gold, smoothstep(0.85, 1.0, s));

    // Blend noise fields
    vec3 color = mix(baseColor * 0.8, baseColor * 1.2, n1);
    color = mix(color, baseColor * 0.6, n2 * 0.3);
    color += baseColor * n3 * 0.15;

    // Vignette
    float vig = 1.0 - smoothstep(0.3, 1.2, length(vUv - 0.5) * 1.5);

    // Only visible in hero section, fade out as you scroll
    float heroFade = 1.0 - smoothstep(0.0, 0.15, s);

    gl_FragColor = vec4(color * vig, 0.18 * heroFade);
  }
`;

export function GradientMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uWallPhase: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    const elapsed = state.clock.getElapsedTime();
    mat.uniforms.uTime.value = elapsed;
    mat.uniforms.uScroll.value = scrollProgress.get();
    // Wall phase: 0→1 over first 6s (tension red), then 1→0 over 3s (back to warm after crack)
    const wallPhase = elapsed < 6.0
      ? Math.min(elapsed / 5.0, 1.0)
      : Math.max(1.0 - (elapsed - 6.0) / 3.0, 0.0);
    mat.uniforms.uWallPhase.value = wallPhase;
  });

  return (
    <mesh ref={meshRef} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
