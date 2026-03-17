"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";

interface MaterialPiece {
  id: number;
  type: "brick" | "steel" | "cement" | "tile" | "stone";
  spawnPos: THREE.Vector3;
  restPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  spawnRotation: THREE.Euler;
  targetRotation: THREE.Euler;
  color: string;
  emissive: string;
  geometry: "box" | "cylinder" | "dodecahedron";
  args: number[];
  delay: number; // staggered drop delay in seconds
  fallDuration: number;
}

function generatePieces(count: number): MaterialPiece[] {
  const pieces: MaterialPiece[] = [];
  let id = 0;

  const addPiece = (
    type: MaterialPiece["type"],
    restPos: [number, number, number],
    targetPos: [number, number, number],
    color: string,
    emissive: string,
    geometry: MaterialPiece["geometry"],
    args: number[],
  ) => {
    if (pieces.length >= count) return;
    const spawnX = (Math.random() - 0.5) * 12;
    const spawnY = 8 + Math.random() * 6;
    const spawnZ = (Math.random() - 0.5) * 3;
    pieces.push({
      id: id++,
      type,
      spawnPos: new THREE.Vector3(spawnX, spawnY, spawnZ),
      restPos: new THREE.Vector3(...restPos),
      targetPos: new THREE.Vector3(...targetPos),
      spawnRotation: new THREE.Euler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ),
      targetRotation: new THREE.Euler(0, 0, 0),
      color,
      emissive,
      geometry,
      args,
      delay: pieces.length * 0.04 + Math.random() * 0.3,
      fallDuration: 0.8 + Math.random() * 0.4,
    });
  };

  // Left wall bricks
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      const restY = -1.5 + row * 0.35 + (Math.random() - 0.5) * 0.1;
      addPiece(
        "brick",
        [-2.8 + col * 0.7, restY, (Math.random() - 0.5) * 0.3],
        [-2.8 + col * 0.7, -1.2 + row * 0.35, 0],
        "#C24411", "#3D1205", "box", [0.6, 0.28, 0.3],
      );
    }
  }

  // Right wall bricks
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      const restY = -1.5 + row * 0.35 + (Math.random() - 0.5) * 0.1;
      const isAlt = row % 2 === 1;
      addPiece(
        "brick",
        [0.5 + col * 0.7, restY, (Math.random() - 0.5) * 0.3],
        [0.5 + col * 0.7, -1.2 + row * 0.35, 0],
        isAlt ? "#E8DDD0" : "#C24411",
        isAlt ? "#2A2520" : "#3D1205",
        "box", [0.6, 0.28, 0.3],
      );
    }
  }

  // Roof steel rods
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const roofY = 0.8 + (1 - Math.abs(t - 0.5) * 2) * 1.6;
    addPiece(
      "steel",
      [-2.5 + t * 5, roofY + (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.3],
      [-2.5 + t * 5, roofY, 0],
      "#7A8590", "#1A1E24", "cylinder", [0.04, 0.04, 1.6, 8],
    );
  }

  // Foundation stones
  for (let i = 0; i < 10; i++) {
    addPiece(
      i % 2 === 0 ? "cement" : "tile",
      [-3.5 + i * 0.75, -1.8 + (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.3],
      [-3.5 + i * 0.75, -1.8, 0],
      i % 2 === 0 ? "#7A8B6A" : "#D4C4A8",
      i % 2 === 0 ? "#1E2318" : "#2A2520",
      "box",
      i % 2 === 0 ? [0.6, 0.35, 0.25] : [0.55, 0.06, 0.55],
    );
  }

  // Scattered stones
  while (pieces.length < count) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 3.5 + Math.random() * 2;
    const x = Math.cos(angle) * dist;
    const y = -1.5 + Math.random() * 3.5;
    addPiece(
      "stone",
      [x + (Math.random() - 0.5) * 0.5, y, Math.sin(angle) * 0.5],
      [x, y, Math.sin(angle) * 0.3],
      "#6B6158", "#1A1815", "dodecahedron", [0.3, 0],
    );
  }

  return pieces;
}

// Easing: fast at start, bounces at end
function easeOutBounce(t: number): number {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    const t2 = t - 1.5 / 2.75;
    return 7.5625 * t2 * t2 + 0.75;
  } else if (t < 2.5 / 2.75) {
    const t2 = t - 2.25 / 2.75;
    return 7.5625 * t2 * t2 + 0.9375;
  } else {
    const t2 = t - 2.625 / 2.75;
    return 7.5625 * t2 * t2 + 0.984375;
  }
}

function AnimatedPiece({ piece }: { piece: MaterialPiece }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tmpVec = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (!meshRef.current) return;
    const elapsed = state.clock.getElapsedTime();
    const scroll = scrollProgress.get();

    // Phase 1: Fall from sky to rest position (first few seconds)
    const fallStart = piece.delay;
    const fallEnd = fallStart + piece.fallDuration;
    const fallProgress = Math.max(0, Math.min(1, (elapsed - fallStart) / piece.fallDuration));
    const fallEased = easeOutBounce(fallProgress);

    // Phase 2: Assemble from rest to house target (scroll-driven)
    const assembleProgress = Math.max(0, Math.min(1, (scroll - 0.05) / 0.5));
    const assembleEased = 1 - Math.pow(1 - assembleProgress, 3);

    if (elapsed < fallEnd + 0.5 && assembleProgress < 0.01) {
      // Still falling or just landed — interpolate spawn → rest
      tmpVec.current.lerpVectors(piece.spawnPos, piece.restPos, fallEased);
      meshRef.current.position.copy(tmpVec.current);

      // Rotation: spinning → settled
      const rotFactor = 1 - fallEased;
      meshRef.current.rotation.set(
        piece.spawnRotation.x * rotFactor,
        piece.spawnRotation.y * rotFactor,
        piece.spawnRotation.z * rotFactor,
      );
    } else {
      // Assemble: rest → target
      tmpVec.current.lerpVectors(piece.restPos, piece.targetPos, assembleEased);
      meshRef.current.position.copy(tmpVec.current);

      meshRef.current.rotation.set(
        piece.spawnRotation.x * (1 - fallEased) * (1 - assembleEased),
        piece.spawnRotation.y * (1 - fallEased) * (1 - assembleEased),
        piece.spawnRotation.z * (1 - fallEased) * (1 - assembleEased),
      );
    }
  });

  const geo = piece.geometry === "box"
    ? <boxGeometry args={piece.args as [number, number, number]} />
    : piece.geometry === "cylinder"
      ? <cylinderGeometry args={piece.args as [number, number, number, number]} />
      : <dodecahedronGeometry args={piece.args as [number, number]} />;

  return (
    <mesh ref={meshRef} castShadow receiveShadow position={piece.spawnPos.toArray()}>
      {geo}
      <meshStandardMaterial
        color={piece.color}
        emissive={piece.emissive}
        emissiveIntensity={0.2}
        roughness={piece.type === "steel" ? 0.3 : 0.78}
        metalness={piece.type === "steel" ? 0.8 : 0.02}
      />
    </mesh>
  );
}

export function AssemblingHouse({ count = 60 }: { count?: number }) {
  const pieces = useMemo(() => generatePieces(count), [count]);

  return (
    <group>
      {pieces.map((piece) => (
        <AnimatedPiece key={piece.id} piece={piece} />
      ))}
    </group>
  );
}
