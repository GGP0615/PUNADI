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
  emissive: string;
  geometry: "box" | "cylinder" | "dodecahedron";
  args: number[];
}

function generateHouseTargets(count: number): MaterialPiece[] {
  const pieces: MaterialPiece[] = [];

  // Left wall bricks — larger, spread wider
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      if (pieces.length >= count) break;
      pieces.push({
        id: pieces.length, type: "brick",
        spawnPos: [(Math.random() - 0.5) * 10, 5 + Math.random() * 12, (Math.random() - 0.5) * 4],
        targetPos: [-2.8 + col * 0.65, -1.2 + row * 0.32, 0],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        targetRotation: [0, 0, 0],
        color: "#B5370B", emissive: "#3D1205",
        geometry: "box", args: [0.6, 0.28, 0.3],
      });
    }
  }

  // Right wall bricks
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      if (pieces.length >= count) break;
      pieces.push({
        id: pieces.length, type: "brick",
        spawnPos: [(Math.random() - 0.5) * 10, 5 + Math.random() * 12, (Math.random() - 0.5) * 4],
        targetPos: [0.4 + col * 0.65, -1.2 + row * 0.32, 0],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        targetRotation: [0, 0, 0],
        color: row % 2 === 0 ? "#B5370B" : "#E8DDD0",
        emissive: row % 2 === 0 ? "#3D1205" : "#2A2520",
        geometry: "box", args: [0.6, 0.28, 0.3],
      });
    }
  }

  // Roof steel rods — thicker
  for (let i = 0; i < 6; i++) {
    if (pieces.length >= count) break;
    const t = i / 5;
    pieces.push({
      id: pieces.length, type: "steel",
      spawnPos: [(Math.random() - 0.5) * 10, 7 + Math.random() * 8, (Math.random() - 0.5) * 4],
      targetPos: [-2.2 + t * 2.2, 1.2 + (1 - Math.abs(t - 0.5) * 2) * 1.4, 0],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      targetRotation: [0, 0, t < 0.5 ? 0.5 : -0.5],
      color: "#6A7380", emissive: "#1A1E24",
      geometry: "cylinder", args: [0.035, 0.035, 1.5, 8],
    });
    if (pieces.length >= count) break;
    pieces.push({
      id: pieces.length, type: "steel",
      spawnPos: [(Math.random() - 0.5) * 10, 7 + Math.random() * 8, (Math.random() - 0.5) * 4],
      targetPos: [t * 2.2, 1.2 + (1 - Math.abs(t - 0.5) * 2) * 1.4, 0],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      targetRotation: [0, 0, t < 0.5 ? 0.5 : -0.5],
      color: "#6A7380", emissive: "#1A1E24",
      geometry: "cylinder", args: [0.035, 0.035, 1.5, 8],
    });
  }

  // Foundation blocks — larger
  for (let i = 0; i < 8; i++) {
    if (pieces.length >= count) break;
    pieces.push({
      id: pieces.length, type: i % 2 === 0 ? "cement" : "tile",
      spawnPos: [(Math.random() - 0.5) * 10, 5 + Math.random() * 12, (Math.random() - 0.5) * 4],
      targetPos: [-3.2 + i * 0.85, -1.6, 0],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      targetRotation: [0, 0, 0],
      color: i % 2 === 0 ? "#7A8B6A" : "#D4C4A8",
      emissive: i % 2 === 0 ? "#1E2318" : "#2A2520",
      geometry: "box", args: i % 2 === 0 ? [0.55, 0.35, 0.22] : [0.5, 0.06, 0.5],
    });
  }

  // Fill remaining with stones — larger
  while (pieces.length < count) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 3.5 + Math.random() * 2.5;
    pieces.push({
      id: pieces.length, type: "stone",
      spawnPos: [(Math.random() - 0.5) * 10, 5 + Math.random() * 12, (Math.random() - 0.5) * 4],
      targetPos: [Math.cos(angle) * dist, -1.2 + Math.random() * 3, Math.sin(angle) * 0.5],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      targetRotation: [0, Math.random() * Math.PI, 0],
      color: "#6B6158", emissive: "#1A1815",
      geometry: "dodecahedron", args: [0.28, 0],
    });
  }

  return pieces;
}

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
        <meshStandardMaterial
          color={piece.color}
          emissive={piece.emissive}
          emissiveIntensity={0.15}
          roughness={piece.type === "steel" ? 0.35 : 0.82}
          metalness={piece.type === "steel" ? 0.75 : 0.02}
        />
      </mesh>
    </RigidBody>
  );
}

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
      <meshStandardMaterial
        color={piece.color}
        emissive={piece.emissive}
        emissiveIntensity={0.15}
        roughness={piece.type === "steel" ? 0.35 : 0.82}
        metalness={piece.type === "steel" ? 0.75 : 0.02}
      />
    </mesh>
  );
}

export function AssemblingHouse({ count = 60 }: { count?: number }) {
  const pieces = useMemo(() => generateHouseTargets(count), [count]);
  const [phase, setPhase] = useState<"physics" | "assembly">("physics");
  const restPositions = useRef<Map<number, { pos: THREE.Vector3; rot: THREE.Euler }>>(new Map());
  const settledCount = useRef(0);

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
