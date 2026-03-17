"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";

interface FloatingShape {
  id: number;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  color: string;
  emissive: string;
  emissiveIntensity: number;
  geometry: "box" | "octahedron" | "cylinder" | "torus";
  speed: number;
  phase: number;
  driftRadius: number;
  rotSpeed: THREE.Vector3;
}

function generateShapes(): FloatingShape[] {
  const shapes: FloatingShape[] = [];

  const palette = [
    { color: "#C24411", emissive: "#6B2408", intensity: 0.3 }, // brick red
    { color: "#D4860A", emissive: "#7A4E06", intensity: 0.4 }, // amber
    { color: "#E8DDD0", emissive: "#4A4540", intensity: 0.15 }, // light stone
    { color: "#7A8B6A", emissive: "#2E3528", intensity: 0.2 }, // cement green
    { color: "#6A7380", emissive: "#2A2E34", intensity: 0.25 }, // steel
    { color: "#B5370B", emissive: "#5A1C06", intensity: 0.35 }, // deep brick
    { color: "#D4A843", emissive: "#6B5422", intensity: 0.4 }, // gold
  ];

  const geometries: FloatingShape["geometry"][] = ["box", "octahedron", "cylinder", "box", "octahedron", "box"];

  // Main constellation — 18 shapes spread in a sphere
  for (let i = 0; i < 18; i++) {
    const t = i / 18;
    const phi = Math.acos(2 * t - 1); // distribute on sphere
    const theta = t * Math.PI * (1 + Math.sqrt(5)); // golden angle

    const radius = 2.5 + Math.random() * 2;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta) * 0.6; // flatten vertically
    const z = radius * Math.cos(phi) * 0.5; // compress depth

    const p = palette[i % palette.length];
    const scale = 0.15 + Math.random() * 0.35;

    shapes.push({
      id: i,
      position: new THREE.Vector3(x, y, z),
      rotation: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ),
      scale,
      color: p.color,
      emissive: p.emissive,
      emissiveIntensity: p.intensity,
      geometry: geometries[i % geometries.length],
      speed: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      driftRadius: 0.3 + Math.random() * 0.5,
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.2,
      ),
    });
  }

  return shapes;
}

function Shape({ shape }: { shape: FloatingShape }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const basePos = useRef(shape.position.clone());

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const scroll = scrollProgress.get();

    // Gentle organic drift
    const drift = shape.driftRadius;
    const s = shape.speed;
    const p = shape.phase;

    meshRef.current.position.set(
      basePos.current.x + Math.sin(t * s + p) * drift,
      basePos.current.y + Math.cos(t * s * 0.7 + p * 1.3) * drift * 0.8,
      basePos.current.z + Math.sin(t * s * 0.5 + p * 0.7) * drift * 0.4,
    );

    // Slow rotation
    meshRef.current.rotation.x += shape.rotSpeed.x * 0.008;
    meshRef.current.rotation.y += shape.rotSpeed.y * 0.008;
    meshRef.current.rotation.z += shape.rotSpeed.z * 0.005;

    // Scroll: gently converge toward center as user scrolls
    const converge = Math.min(1, scroll * 2);
    meshRef.current.position.lerp(
      new THREE.Vector3(0, 0, 0),
      converge * 0.15,
    );

    // Scroll: subtle scale pulse
    const scalePulse = 1 + Math.sin(t * 0.5 + shape.phase) * 0.05;
    const scrollScale = 1 - converge * 0.3;
    meshRef.current.scale.setScalar(shape.scale * scalePulse * scrollScale);
  });

  const geo = shape.geometry === "box"
    ? <boxGeometry args={[1, 1, 1]} />
    : shape.geometry === "octahedron"
      ? <octahedronGeometry args={[1, 0]} />
      : shape.geometry === "cylinder"
        ? <cylinderGeometry args={[0.5, 0.5, 1.2, 6]} />
        : <torusGeometry args={[0.5, 0.2, 8, 16]} />;

  return (
    <mesh
      ref={meshRef}
      position={shape.position.toArray()}
      rotation={shape.rotation}
      scale={shape.scale}
      castShadow
    >
      {geo}
      <meshStandardMaterial
        color={shape.color}
        emissive={shape.emissive}
        emissiveIntensity={shape.emissiveIntensity}
        roughness={0.6}
        metalness={0.15}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

export function AssemblingHouse({ count = 18 }: { count?: number }) {
  const shapes = useMemo(() => generateShapes().slice(0, count), [count]);

  return (
    <group>
      {shapes.map((shape) => (
        <Shape key={shape.id} shape={shape} />
      ))}
    </group>
  );
}
