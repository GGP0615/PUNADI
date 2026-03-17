"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";

interface FloatingShape {
  id: number;
  basePosition: THREE.Vector3;
  scale: number;
  color: string;
  emissive: string;
  emissiveIntensity: number;
  geometry: "roundedBox" | "octahedron" | "hexPrism" | "torus";
  speed: number;
  phase: number;
  driftRadius: number;
  rotSpeed: THREE.Vector3;
  depthLayer: number; // 0=far, 1=mid, 2=near — for parallax strength
}

function generateShapes(): FloatingShape[] {
  const shapes: FloatingShape[] = [];

  const palette = [
    { color: "#D4860A", emissive: "#7A4E06", intensity: 0.5 },  // warm amber
    { color: "#C24411", emissive: "#6B2408", intensity: 0.35 },  // brick
    { color: "#D4A843", emissive: "#8B6F2A", intensity: 0.5 },   // gold
    { color: "#1A6B6A", emissive: "#0E3B3A", intensity: 0.3 },   // teal
    { color: "#7A8590", emissive: "#2A2E34", intensity: 0.2 },   // steel
    { color: "#B5370B", emissive: "#5A1C06", intensity: 0.4 },   // deep red
    { color: "#E8DDD0", emissive: "#6A6258", intensity: 0.15 },  // stone
  ];

  const geometries: FloatingShape["geometry"][] = [
    "roundedBox", "octahedron", "hexPrism", "roundedBox", "octahedron", "torus",
  ];

  for (let i = 0; i < 22; i++) {
    // Golden-angle spiral distribution
    const t = i / 22;
    const phi = Math.acos(1 - 2 * t);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;

    const radius = 2.2 + Math.random() * 2.5;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta) * 0.55;
    const z = (Math.random() - 0.5) * 3;

    const p = palette[i % palette.length];
    const depthLayer = z > 0.5 ? 2 : z < -0.5 ? 0 : 1;
    // Near shapes slightly larger, far shapes slightly smaller
    const baseScale = 0.12 + Math.random() * 0.28;
    const depthScale = depthLayer === 2 ? 1.2 : depthLayer === 0 ? 0.7 : 1;

    shapes.push({
      id: i,
      basePosition: new THREE.Vector3(x, y, z),
      scale: baseScale * depthScale,
      color: p.color,
      emissive: p.emissive,
      emissiveIntensity: p.intensity,
      geometry: geometries[i % geometries.length],
      speed: 0.1 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      driftRadius: 0.2 + Math.random() * 0.4,
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.15,
      ),
      depthLayer,
    });
  }

  return shapes;
}

// Shared mouse position for parallax
const mousePos = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("mousemove", (e) => {
    mousePos.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mousePos.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });
}

function Shape({ shape }: { shape: FloatingShape }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const scroll = scrollProgress.get();

    // Organic drift
    const s = shape.speed;
    const p = shape.phase;
    const d = shape.driftRadius;

    const driftX = Math.sin(t * s + p) * d;
    const driftY = Math.cos(t * s * 0.7 + p * 1.3) * d * 0.7;
    const driftZ = Math.sin(t * s * 0.4 + p * 0.7) * d * 0.3;

    // Mouse parallax — deeper shapes move less, near shapes move more
    const parallaxStrength = (shape.depthLayer + 1) * 0.12;
    const mx = mousePos.x * parallaxStrength;
    const my = mousePos.y * parallaxStrength * 0.6;

    meshRef.current.position.set(
      shape.basePosition.x + driftX + mx,
      shape.basePosition.y + driftY + my,
      shape.basePosition.z + driftZ,
    );

    // Slow rotation
    meshRef.current.rotation.x += shape.rotSpeed.x * 0.006;
    meshRef.current.rotation.y += shape.rotSpeed.y * 0.006;
    meshRef.current.rotation.z += shape.rotSpeed.z * 0.004;

    // Scroll: spread outward + fade
    const scrollFactor = Math.min(1, scroll * 3);
    const spread = 1 + scrollFactor * 0.5;
    meshRef.current.position.multiplyScalar(spread);

    // Subtle breathing scale
    const breathe = 1 + Math.sin(t * 0.4 + shape.phase) * 0.04;
    const scrollScale = 1 - scrollFactor * 0.4;
    meshRef.current.scale.setScalar(shape.scale * breathe * scrollScale);
  });

  // Geometries with more visual interest
  let geo;
  switch (shape.geometry) {
    case "roundedBox":
      geo = <boxGeometry args={[1, 1, 1]} />;
      break;
    case "octahedron":
      geo = <octahedronGeometry args={[1, 0]} />;
      break;
    case "hexPrism":
      geo = <cylinderGeometry args={[0.6, 0.6, 0.8, 6]} />;
      break;
    case "torus":
      geo = <torusGeometry args={[0.6, 0.22, 12, 24]} />;
      break;
  }

  // Far shapes are more transparent — creates depth
  const opacity = shape.depthLayer === 0 ? 0.5 : shape.depthLayer === 1 ? 0.75 : 0.9;

  return (
    <mesh
      ref={meshRef}
      position={shape.basePosition.toArray()}
      scale={shape.scale}
      castShadow
    >
      {geo}
      <meshStandardMaterial
        color={shape.color}
        emissive={shape.emissive}
        emissiveIntensity={shape.emissiveIntensity}
        roughness={0.55}
        metalness={0.2}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

// Constellation lines between nearby shapes
function ConstellationLines({ shapes }: { shapes: FloatingShape[] }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const maxDistance = 3.2;

  // Pre-compute pairs
  const pairs = useMemo(() => {
    const result: [number, number][] = [];
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        const dist = shapes[i].basePosition.distanceTo(shapes[j].basePosition);
        if (dist < maxDistance) {
          result.push([i, j]);
        }
      }
    }
    return result;
  }, [shapes]);

  const posArray = useMemo(() => new Float32Array(pairs.length * 6), [pairs]);

  useFrame((state) => {
    if (!lineRef.current) return;
    const geo = lineRef.current.geometry;
    const positions = geo.attributes.position.array as Float32Array;
    const t = state.clock.getElapsedTime();
    const scroll = scrollProgress.get();
    const scrollFactor = Math.min(1, scroll * 3);
    const spread = 1 + scrollFactor * 0.5;

    for (let p = 0; p < pairs.length; p++) {
      const [i, j] = pairs[p];
      const si = shapes[i];
      const sj = shapes[j];

      const di = si.driftRadius;
      const dj = sj.driftRadius;

      // Match shape positions (drift + parallax)
      const pxi = (si.basePosition.x + Math.sin(t * si.speed + si.phase) * di + mousePos.x * (si.depthLayer + 1) * 0.12) * spread;
      const pyi = (si.basePosition.y + Math.cos(t * si.speed * 0.7 + si.phase * 1.3) * di * 0.7 + mousePos.y * (si.depthLayer + 1) * 0.072) * spread;
      const pzi = (si.basePosition.z + Math.sin(t * si.speed * 0.4 + si.phase * 0.7) * di * 0.3) * spread;

      const pxj = (sj.basePosition.x + Math.sin(t * sj.speed + sj.phase) * dj + mousePos.x * (sj.depthLayer + 1) * 0.12) * spread;
      const pyj = (sj.basePosition.y + Math.cos(t * sj.speed * 0.7 + sj.phase * 1.3) * dj * 0.7 + mousePos.y * (sj.depthLayer + 1) * 0.072) * spread;
      const pzj = (sj.basePosition.z + Math.sin(t * sj.speed * 0.4 + sj.phase * 0.7) * dj * 0.3) * spread;

      positions[p * 6 + 0] = pxi;
      positions[p * 6 + 1] = pyi;
      positions[p * 6 + 2] = pzi;
      positions[p * 6 + 3] = pxj;
      positions[p * 6 + 4] = pyj;
      positions[p * 6 + 5] = pzj;
    }

    geo.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[posArray, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#C17817"
        transparent
        opacity={0.08}
        linewidth={1}
      />
    </lineSegments>
  );
}

export function AssemblingHouse({ count = 22 }: { count?: number }) {
  const shapes = useMemo(() => generateShapes().slice(0, count), [count]);

  return (
    <group>
      <ConstellationLines shapes={shapes} />
      {shapes.map((shape) => (
        <Shape key={shape.id} shape={shape} />
      ))}
    </group>
  );
}
