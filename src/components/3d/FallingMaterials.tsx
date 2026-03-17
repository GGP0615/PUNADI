"use client";

import { useRef, useMemo } from "react";
import {
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";

type MaterialType = "redBrick" | "aacBlock" | "cementBag" | "steelRod" | "sand" | "stone" | "tile";

interface MaterialPiece {
  id: number;
  type: MaterialType;
  position: [number, number, number];
  rotation: [number, number, number];
}

/* ─── Click handler: bounce the block ─── */
function bounceBlock(ref: React.RefObject<RapierRigidBody | null>) {
  if (!ref.current) return;
  ref.current.applyImpulse(
    {
      x: (Math.random() - 0.5) * 4,
      y: 3 + Math.random() * 3,
      z: (Math.random() - 0.5) * 4,
    },
    true
  );
  ref.current.applyTorqueImpulse(
    {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 2,
    },
    true
  );
}

/* ─── Indian Red Clay Brick ─── */
function RedBrick({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const ref = useRef<RapierRigidBody>(null);
  return (
    <RigidBody ref={ref} position={position} rotation={rotation} colliders="cuboid" restitution={0.15} friction={0.9} linearDamping={0.3} angularDamping={0.5}>
      <mesh castShadow receiveShadow onClick={() => bounceBlock(ref)} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
        <boxGeometry args={[0.5, 0.22, 0.25]} />
        <meshStandardMaterial color="#B5370B" roughness={0.92} metalness={0.02} />
      </mesh>
    </RigidBody>
  );
}

/* ─── AAC Block ─── */
function AACBlock({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const ref = useRef<RapierRigidBody>(null);
  return (
    <RigidBody ref={ref} position={position} rotation={rotation} colliders="cuboid" restitution={0.1} friction={0.85} linearDamping={0.3} angularDamping={0.5}>
      <mesh castShadow receiveShadow onClick={() => bounceBlock(ref)} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
        <boxGeometry args={[0.6, 0.3, 0.25]} />
        <meshStandardMaterial color="#E8DDD0" roughness={0.95} metalness={0.0} />
      </mesh>
    </RigidBody>
  );
}

/* ─── Cement Bag ─── */
function CementBag({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const ref = useRef<RapierRigidBody>(null);
  return (
    <RigidBody ref={ref} position={position} rotation={rotation} colliders="cuboid" restitution={0.05} friction={0.95} linearDamping={0.5} angularDamping={0.6}>
      <group>
        <mesh castShadow receiveShadow onClick={() => bounceBlock(ref)} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
          <boxGeometry args={[0.45, 0.28, 0.18]} />
          <meshStandardMaterial color="#7A8B6A" roughness={0.9} metalness={0.0} />
        </mesh>
        <mesh position={[0, 0, 0.091]}>
          <planeGeometry args={[0.35, 0.12]} />
          <meshStandardMaterial color="#F5F0E0" roughness={0.85} />
        </mesh>
      </group>
    </RigidBody>
  );
}

/* ─── TMT Steel Rod ─── */
function SteelRod({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const ref = useRef<RapierRigidBody>(null);
  return (
    <RigidBody ref={ref} position={position} rotation={rotation} colliders="cuboid" restitution={0.3} friction={0.6} linearDamping={0.2} angularDamping={0.4}>
      <mesh castShadow receiveShadow onClick={() => bounceBlock(ref)} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
        <meshStandardMaterial color="#5A6370" roughness={0.35} metalness={0.75} />
      </mesh>
    </RigidBody>
  );
}

/* ─── Sand Clump ─── */
function SandClump({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const ref = useRef<RapierRigidBody>(null);
  return (
    <RigidBody ref={ref} position={position} rotation={rotation} colliders="cuboid" restitution={0.05} friction={1.0} linearDamping={0.6} angularDamping={0.7}>
      <mesh castShadow receiveShadow onClick={() => bounceBlock(ref)} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
        <sphereGeometry args={[0.18, 6, 5]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.98} metalness={0.0} />
      </mesh>
    </RigidBody>
  );
}

/* ─── Stone Chunk ─── */
function StoneChunk({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const ref = useRef<RapierRigidBody>(null);
  return (
    <RigidBody ref={ref} position={position} rotation={rotation} colliders="cuboid" restitution={0.2} friction={0.85} linearDamping={0.3} angularDamping={0.5}>
      <mesh castShadow receiveShadow onClick={() => bounceBlock(ref)} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#6B6158" roughness={0.88} metalness={0.05} />
      </mesh>
    </RigidBody>
  );
}

/* ─── Floor Tile ─── */
function FloorTile({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const ref = useRef<RapierRigidBody>(null);
  return (
    <RigidBody ref={ref} position={position} rotation={rotation} colliders="cuboid" restitution={0.1} friction={0.7} linearDamping={0.3} angularDamping={0.5}>
      <mesh castShadow receiveShadow onClick={() => bounceBlock(ref)} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
        <boxGeometry args={[0.4, 0.04, 0.4]} />
        <meshStandardMaterial color="#D4C4A8" roughness={0.6} metalness={0.1} />
      </mesh>
    </RigidBody>
  );
}

const COMPONENT_MAP: Record<MaterialType, React.FC<{ position: [number, number, number]; rotation: [number, number, number] }>> = {
  redBrick: RedBrick,
  aacBlock: AACBlock,
  cementBag: CementBag,
  steelRod: SteelRod,
  sand: SandClump,
  stone: StoneChunk,
  tile: FloorTile,
};

export function FallingMaterials({ count = 70 }: { count?: number }) {
  const pieces = useMemo<MaterialPiece[]>(() => {
    const types: MaterialType[] = [
      "redBrick", "redBrick", "redBrick", "redBrick",
      "aacBlock", "aacBlock",
      "cementBag", "cementBag", "cementBag",
      "steelRod", "steelRod",
      "sand", "sand",
      "stone",
      "tile",
    ];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      type: types[i % types.length],
      position: [
        (Math.random() - 0.5) * 8,
        4 + Math.random() * 15,
        (Math.random() - 0.5) * 6,
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ] as [number, number, number],
    }));
  }, [count]);

  return (
    <group>
      {pieces.map((piece) => {
        const Component = COMPONENT_MAP[piece.type];
        return (
          <Component
            key={piece.id}
            position={piece.position}
            rotation={piece.rotation}
          />
        );
      })}
      <CuboidCollider position={[0, -2, 0]} args={[20, 0.5, 20]} />
    </group>
  );
}
