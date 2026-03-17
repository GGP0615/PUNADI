"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CuboidCollider, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";

interface MaterialPiece {
  id: number;
  type: "brick" | "steel" | "cement" | "tile" | "stone";
  spawnPos: [number, number, number];
  targetPos: [number, number, number];
  rotation: [number, number, number];
  targetRotation: [number, number, number];
  color: string;
  geometry: "box" | "cylinder" | "dodecahedron";
  args: number[];
}

function generateHouseTargets(count: number): MaterialPiece[] {
  const pieces: MaterialPiece[] = [];
  const colors: Record<string, string> = {
    brick: "#B5370B",
    steel: "#5A6370",
    cement: "#7A8B6A",
    tile: "#D4C4A8",
    stone: "#6B6158",
  };

  // Left wall bricks
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      if (pieces.length >= count) break;
      pieces.push({
        id: pieces.length, type: "brick",
        spawnPos: [(Math.random() - 0.5) * 8, 4 + Math.random() * 15, (Math.random() - 0.5) * 6],
        targetPos: [-2.5 + col * 0.55, -1.5 + row * 0.25, 0],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        targetRotation: [0, 0, 0],
        color: colors.brick, geometry: "box", args: [0.5, 0.22, 0.25],
      });
    }
  }

  // Right wall bricks
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      if (pieces.length >= count) break;
      pieces.push({
        id: pieces.length, type: "brick",
        spawnPos: [(Math.random() - 0.5) * 8, 4 + Math.random() * 15, (Math.random() - 0.5) * 6],
        targetPos: [0.3 + col * 0.55, -1.5 + row * 0.25, 0],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        targetRotation: [0, 0, 0],
        color: row % 2 === 0 ? "#B5370B" : "#E8DDD0",
        geometry: "box", args: [0.5, 0.22, 0.25],
      });
    }
  }

  // Roof steel rods
  for (let i = 0; i < 6; i++) {
    if (pieces.length >= count) break;
    const t = i / 5;
    pieces.push({
      id: pieces.length, type: "steel",
      spawnPos: [(Math.random() - 0.5) * 8, 6 + Math.random() * 10, (Math.random() - 0.5) * 6],
      targetPos: [-2 + t * 2, 1.0 + (1 - Math.abs(t - 0.5) * 2) * 1.2, 0],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      targetRotation: [0, 0, t < 0.5 ? 0.5 : -0.5],
      color: colors.steel, geometry: "cylinder", args: [0.02, 0.02, 1.2, 8],
    });
    if (pieces.length >= count) break;
    pieces.push({
      id: pieces.length, type: "steel",
      spawnPos: [(Math.random() - 0.5) * 8, 6 + Math.random() * 10, (Math.random() - 0.5) * 6],
      targetPos: [t * 2, 1.0 + (1 - Math.abs(t - 0.5) * 2) * 1.2, 0],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      targetRotation: [0, 0, t < 0.5 ? 0.5 : -0.5],
      color: colors.steel, geometry: "cylinder", args: [0.02, 0.02, 1.2, 8],
    });
  }

  // Foundation
  for (let i = 0; i < 8; i++) {
    if (pieces.length >= count) break;
    pieces.push({
      id: pieces.length, type: i % 2 === 0 ? "cement" : "tile",
      spawnPos: [(Math.random() - 0.5) * 8, 4 + Math.random() * 15, (Math.random() - 0.5) * 6],
      targetPos: [-3 + i * 0.75, -1.8, 0],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      targetRotation: [0, 0, 0],
      color: i % 2 === 0 ? colors.cement : colors.tile,
      geometry: "box", args: i % 2 === 0 ? [0.45, 0.28, 0.18] : [0.4, 0.04, 0.4],
    });
  }

  // Fill remaining with stones
  while (pieces.length < count) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 3 + Math.random() * 2;
    pieces.push({
      id: pieces.length, type: "stone",
      spawnPos: [(Math.random() - 0.5) * 8, 4 + Math.random() * 15, (Math.random() - 0.5) * 6],
      targetPos: [Math.cos(angle) * dist, -1.5 + Math.random() * 3, Math.sin(angle) * 0.5],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      targetRotation: [0, Math.random() * Math.PI, 0],
      color: "#6B6158", geometry: "dodecahedron", args: [0.2, 0],
    });
  }

  return pieces;
}

/** Phase 1: Physics falling — renders as RigidBody, captures resting position */
function PhysicsPiece({ piece, onRest }: {
  piece: MaterialPiece;
  onRest: (id: number, pos: THREE.Vector3, rot: THREE.Euler) => void;
}) {
  const rigidRef = useRef<RapierRigidBody>(null);
  const reported = useRef(false);

  useFrame(() => {
    if (reported.current || !rigidRef.current) return;
    const vel = rigidRef.current.linvel();
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
    // Settled when velocity is very low
    if (speed < 0.05) {
      const t = rigidRef.current.translation();
      const r = rigidRef.current.rotation();
      onRest(piece.id, new THREE.Vector3(t.x, t.y, t.z), new THREE.Euler(r.x, r.y, r.z));
      reported.current = true;
    }
  });

  const geo = piece.geometry === "box"
    ? <boxGeometry args={piece.args as [number, number, number]} />
    : piece.geometry === "cylinder"
      ? <cylinderGeometry args={piece.args as [number, number, number, number]} />
      : <dodecahedronGeometry args={piece.args as [number, number]} />;

  return (
    <RigidBody
      ref={rigidRef}
      position={piece.spawnPos}
      rotation={piece.rotation}
      colliders="cuboid"
      restitution={0.15}
      friction={0.9}
      linearDamping={0.3}
      angularDamping={0.5}
    >
      <mesh castShadow receiveShadow>
        {geo}
        <meshStandardMaterial color={piece.color} roughness={0.85} metalness={piece.type === "steel" ? 0.75 : 0.02} />
      </mesh>
    </RigidBody>
  );
}

/** Phase 2: Assembly — no physics, lerps from rest position to target on scroll */
function AssemblyPiece({ piece, restPos, restRot }: {
  piece: MaterialPiece;
  restPos: THREE.Vector3;
  restRot: THREE.Euler;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetVec = useMemo(() => new THREE.Vector3(...piece.targetPos), [piece.targetPos]);
  const lerpVec = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!meshRef.current) return;
    const scroll = scrollProgress.get();
    const progress = Math.max(0, Math.min(1, (scroll - 0.1) / 0.7));
    const eased = 1 - Math.pow(1 - progress, 3);

    lerpVec.current.lerpVectors(restPos, targetVec, eased);
    meshRef.current.position.copy(lerpVec.current);

    meshRef.current.rotation.set(
      restRot.x + (piece.targetRotation[0] - restRot.x) * eased,
      restRot.y + (piece.targetRotation[1] - restRot.y) * eased,
      restRot.z + (piece.targetRotation[2] - restRot.z) * eased,
    );
  });

  const geo = piece.geometry === "box"
    ? <boxGeometry args={piece.args as [number, number, number]} />
    : piece.geometry === "cylinder"
      ? <cylinderGeometry args={piece.args as [number, number, number, number]} />
      : <dodecahedronGeometry args={piece.args as [number, number]} />;

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {geo}
      <meshStandardMaterial color={piece.color} roughness={0.85} metalness={piece.type === "steel" ? 0.75 : 0.02} />
    </mesh>
  );
}

export function AssemblingHouse({ count = 60 }: { count?: number }) {
  const pieces = useMemo(() => generateHouseTargets(count), [count]);
  const [phase, setPhase] = useState<"physics" | "assembly">("physics");
  const restPositions = useRef<Map<number, { pos: THREE.Vector3; rot: THREE.Euler }>>(new Map());
  const settledCount = useRef(0);

  // After 4 seconds, force transition to assembly even if not all settled
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === "physics") setPhase("assembly");
    }, 4000);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleRest = (id: number, pos: THREE.Vector3, rot: THREE.Euler) => {
    if (restPositions.current.has(id)) return;
    restPositions.current.set(id, { pos, rot });
    settledCount.current++;
    // Transition when 80% of pieces have settled
    if (settledCount.current >= count * 0.8 && phase === "physics") {
      setPhase("assembly");
    }
  };

  if (phase === "physics") {
    return (
      <group>
        {pieces.map((piece) => (
          <PhysicsPiece key={piece.id} piece={piece} onRest={handleRest} />
        ))}
        <CuboidCollider position={[0, -2, 0]} args={[20, 0.5, 20]} />
      </group>
    );
  }

  // Assembly phase — pieces lerp to house shape on scroll
  return (
    <group>
      {pieces.map((piece) => {
        const rest = restPositions.current.get(piece.id);
        return (
          <AssemblyPiece
            key={piece.id}
            piece={piece}
            restPos={rest?.pos ?? new THREE.Vector3(...piece.spawnPos)}
            restRot={rest?.rot ?? new THREE.Euler(...piece.rotation)}
          />
        );
      })}
    </group>
  );
}
