"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollProgress } from "@/lib/scrollProgress";

// ── Floor plan geometry ──
// An Indian house floor plan — hall, 2 bedrooms, kitchen, bathroom, pooja
// Coordinates in X,Z plane, viewed at slight angle
// All measurements in relative units (roughly 1 unit = 1 meter)

interface WallSegment {
  start: [number, number];
  end: [number, number];
  drawOrder: number; // 0–1, when this line starts drawing
  type: "outer" | "inner" | "dimension" | "annotation";
}

const PLAN_WIDTH = 10;
const PLAN_DEPTH = 8;

// Offset to center the plan
const ox = -PLAN_WIDTH / 2;
const oz = -PLAN_DEPTH / 2;

function p(x: number, z: number): [number, number] {
  return [x + ox, z + oz];
}

const WALL_SEGMENTS: WallSegment[] = [
  // ── Outer walls (draw first, 0.0–0.25) ──
  { start: p(0, 0), end: p(10, 0), drawOrder: 0.0, type: "outer" },    // bottom
  { start: p(10, 0), end: p(10, 8), drawOrder: 0.05, type: "outer" },   // right
  { start: p(10, 8), end: p(0, 8), drawOrder: 0.10, type: "outer" },    // top
  { start: p(0, 8), end: p(0, 0), drawOrder: 0.15, type: "outer" },     // left

  // ── Inner walls — room divisions (0.25–0.55) ──
  // Hall/Kitchen divider (horizontal, partial — door gap at right)
  { start: p(0, 4.5), end: p(3.8, 4.5), drawOrder: 0.25, type: "inner" },
  // Kitchen/Bath divider (vertical)
  { start: p(3.8, 0), end: p(3.8, 4.5), drawOrder: 0.30, type: "inner" },
  // Bath wall (partial — door gap)
  { start: p(3.8, 2.2), end: p(6, 2.2), drawOrder: 0.35, type: "inner" },
  // Hall/Bedroom vertical divider
  { start: p(6, 0), end: p(6, 8), drawOrder: 0.28, type: "inner" },
  // Bedroom 1/2 horizontal divider (partial — door gap at left end)
  { start: p(6.8, 4.2), end: p(10, 4.2), drawOrder: 0.40, type: "inner" },
  // Pooja room (small alcove top-left)
  { start: p(0, 6.5), end: p(2, 6.5), drawOrder: 0.45, type: "inner" },
  { start: p(2, 6.5), end: p(2, 8), drawOrder: 0.47, type: "inner" },

  // ── Door openings represented as thin lines (0.50–0.65) ──
  // Front door (bottom wall gap marker)
  { start: p(4.5, -0.15), end: p(5.5, -0.15), drawOrder: 0.50, type: "annotation" },
  // Kitchen door
  { start: p(3.8, 3.0), end: p(3.8, 3.8), drawOrder: 0.52, type: "annotation" },
  // Bedroom 1 door
  { start: p(6, 5.5), end: p(6, 6.3), drawOrder: 0.54, type: "annotation" },
  // Bedroom 2 door
  { start: p(6, 1.5), end: p(6, 2.3), drawOrder: 0.56, type: "annotation" },
  // Bathroom door
  { start: p(4.8, 2.2), end: p(5.5, 2.2), drawOrder: 0.58, type: "annotation" },

  // ── Dimension lines (0.65–0.85) ──
  // Bottom dimension
  { start: p(0, -0.6), end: p(10, -0.6), drawOrder: 0.65, type: "dimension" },
  { start: p(0, -0.4), end: p(0, -0.8), drawOrder: 0.66, type: "dimension" },
  { start: p(10, -0.4), end: p(10, -0.8), drawOrder: 0.67, type: "dimension" },
  // Right dimension
  { start: p(10.6, 0), end: p(10.6, 8), drawOrder: 0.70, type: "dimension" },
  { start: p(10.4, 0), end: p(10.8, 0), drawOrder: 0.71, type: "dimension" },
  { start: p(10.4, 8), end: p(10.8, 8), drawOrder: 0.72, type: "dimension" },
  // Internal dimension — kitchen width
  { start: p(0, -0.3), end: p(3.8, -0.3), drawOrder: 0.75, type: "dimension" },
  // Internal dimension — bedroom depth
  { start: p(10.3, 0), end: p(10.3, 4.2), drawOrder: 0.78, type: "dimension" },

  // ── Fixture markers — column dots and staircase (0.80–1.0) ──
  // Staircase lines (3 steps in hall area)
  { start: p(4.5, 6.5), end: p(5.5, 6.5), drawOrder: 0.82, type: "annotation" },
  { start: p(4.5, 7.0), end: p(5.5, 7.0), drawOrder: 0.84, type: "annotation" },
  { start: p(4.5, 7.5), end: p(5.5, 7.5), drawOrder: 0.86, type: "annotation" },
  { start: p(4.5, 6.5), end: p(4.5, 7.5), drawOrder: 0.83, type: "annotation" },
  { start: p(5.5, 6.5), end: p(5.5, 7.5), drawOrder: 0.85, type: "annotation" },

  // Window markers (small crosses on outer walls)
  { start: p(1.5, -0.1), end: p(2.5, -0.1), drawOrder: 0.88, type: "annotation" },
  { start: p(7.5, -0.1), end: p(8.5, -0.1), drawOrder: 0.90, type: "annotation" },
  { start: p(-0.1, 2), end: p(-0.1, 3), drawOrder: 0.92, type: "annotation" },
  { start: p(10.1, 5.5), end: p(10.1, 6.5), drawOrder: 0.94, type: "annotation" },
];

// Vertex shader: passes draw order to fragment for progressive reveal
const vertexShader = `
  attribute float aDrawOrder;
  attribute float aType;
  varying float vDrawOrder;
  varying float vType;

  void main() {
    vDrawOrder = aDrawOrder;
    vType = aType;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader: reveals lines progressively, with glow
const fragmentShader = `
  uniform float uProgress;
  uniform float uPulse;
  uniform float uFade;
  varying float vDrawOrder;
  varying float vType;

  void main() {
    // Progressive reveal: line only visible when progress passes its drawOrder
    if (vDrawOrder > uProgress) discard;

    // Lines that just appeared are brighter (drawing edge glow)
    float edgeDist = uProgress - vDrawOrder;
    float edgeGlow = smoothstep(0.0, 0.06, edgeDist);
    float drawGlow = 1.0 + (1.0 - edgeGlow) * 2.0; // 3x brightness at drawing edge

    // Base color by type
    vec3 outerColor = vec3(0.757, 0.471, 0.09);   // amber #C17817
    vec3 innerColor = vec3(0.6, 0.38, 0.1);         // muted amber
    vec3 dimColor   = vec3(0.4, 0.3, 0.15);         // faint gold
    vec3 annoColor  = vec3(0.5, 0.35, 0.12);        // subtle warm

    vec3 color = outerColor;
    float baseAlpha = 0.5;

    if (vType > 2.5) {
      // annotation
      color = annoColor;
      baseAlpha = 0.25;
    } else if (vType > 1.5) {
      // dimension
      color = dimColor;
      baseAlpha = 0.2;
    } else if (vType > 0.5) {
      // inner
      color = innerColor;
      baseAlpha = 0.4;
    }

    // Subtle pulse
    float pulse = 1.0 + uPulse * 0.15;

    float alpha = baseAlpha * drawGlow * pulse * uFade;
    gl_FragColor = vec4(color * drawGlow * pulse, alpha);
  }
`;

// Shared mouse position
const mousePos = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("mousemove", (e) => {
    mousePos.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mousePos.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });
}

const TYPE_MAP = { outer: 0, inner: 1, dimension: 2, annotation: 3 };

export function BlueprintFloorplan() {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const startTime = useRef<number | null>(null);

  const { geometry, uniforms } = useMemo(() => {
    const positions: number[] = [];
    const drawOrders: number[] = [];
    const types: number[] = [];

    for (const seg of WALL_SEGMENTS) {
      // Each segment is 2 vertices (LineSegments)
      positions.push(seg.start[0], 0, seg.start[1]);
      positions.push(seg.end[0], 0, seg.end[1]);
      drawOrders.push(seg.drawOrder, seg.drawOrder);
      const t = TYPE_MAP[seg.type];
      types.push(t, t);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("aDrawOrder", new THREE.Float32BufferAttribute(drawOrders, 1));
    geo.setAttribute("aType", new THREE.Float32BufferAttribute(types, 1));

    const unis = {
      uProgress: { value: 0 },
      uPulse: { value: 0 },
      uFade: { value: 1 },
    };

    return { geometry: geo, uniforms: unis };
  }, []);

  useFrame((state) => {
    if (!groupRef.current || !matRef.current) return;

    const t = state.clock.getElapsedTime();
    const scroll = scrollProgress.get();

    // Start drawing after a delay (wall crack reveal needs to settle)
    if (startTime.current === null) {
      startTime.current = t;
    }

    const elapsed = t - startTime.current;

    // Draw progress: 0→1 over 4 seconds, starting 0.8s after mount
    const drawDelay = 0.8;
    const drawDuration = 4.0;
    const progress = Math.min(1, Math.max(0, (elapsed - drawDelay) / drawDuration));
    // Ease out cubic for satisfying draw feel
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    matRef.current.uniforms.uProgress.value = easedProgress;

    // Subtle pulse (breathing)
    matRef.current.uniforms.uPulse.value = Math.sin(t * 0.8) * 0.5 + 0.5;

    // Scroll fade
    const scrollFade = 1 - Math.min(1, scroll * 4);
    matRef.current.uniforms.uFade.value = scrollFade;

    // Slow rotation — examining the blueprint
    groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.08 + 0.15;

    // Mouse parallax
    const mx = mousePos.x * 0.3;
    const my = mousePos.y * 0.15;
    groupRef.current.position.x = mx;
    groupRef.current.position.z = my;

    // Scroll: push back and down
    groupRef.current.position.y = -0.5 - scroll * 2;
    groupRef.current.position.z += scroll * -3;
  });

  return (
    <group
      ref={groupRef}
      // Tilt the floor plan toward the viewer — not flat, slightly angled
      rotation={[-Math.PI * 0.35, 0.15, 0]}
      position={[0, -0.5, 0]}
      scale={0.45}
    >
      <lineSegments geometry={geometry}>
        <shaderMaterial
          ref={matRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Faint grid background behind the plan — blueprint paper feel */}
      <BlueprintGrid />
    </group>
  );
}

// ── Blueprint grid — faint grid lines like graph paper ──
function BlueprintGrid() {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const pad = 1.5;
    const step = 1;

    // Horizontal lines
    for (let z = -PLAN_DEPTH / 2 - pad; z <= PLAN_DEPTH / 2 + pad; z += step) {
      positions.push(-PLAN_WIDTH / 2 - pad, -0.01, z);
      positions.push(PLAN_WIDTH / 2 + pad, -0.01, z);
    }

    // Vertical lines
    for (let x = -PLAN_WIDTH / 2 - pad; x <= PLAN_WIDTH / 2 + pad; x += step) {
      positions.push(x, -0.01, -PLAN_DEPTH / 2 - pad);
      positions.push(x, -0.01, PLAN_DEPTH / 2 + pad);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return geo;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#C17817"
        transparent
        opacity={0.03}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}
