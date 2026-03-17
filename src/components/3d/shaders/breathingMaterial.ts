import * as THREE from "three";

/**
 * Injects breathing vertex displacement + fresnel edge glow into any MeshStandardMaterial.
 * Call applyBreathingShader(material) after creating the material.
 */
export function applyBreathingShader(material: THREE.MeshStandardMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uFresnelColor = { value: new THREE.Color("#C17817") };
    shader.uniforms.uFresnelPower = { value: 3.0 };
    shader.uniforms.uBreathingAmp = { value: 0.005 };

    // Store the update function on the material for useFrame access
    (material as any)._shaderRef = shader;

    // Vertex: breathing displacement
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `#include <common>
      uniform float uTime;
      uniform float uBreathingAmp;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      float breathe = sin(uTime * 1.5 + position.x * 3.0 + position.y * 2.0) * uBreathingAmp;
      transformed += normal * breathe;`
    );

    // Fragment: fresnel edge glow
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>
      uniform float uTime;
      uniform vec3 uFresnelColor;
      uniform float uFresnelPower;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `#include <dithering_fragment>
      vec3 viewDir = normalize(vViewPosition);
      vec3 worldNormal = normalize(vNormal);
      float fresnel = pow(1.0 - abs(dot(viewDir, worldNormal)), uFresnelPower);
      gl_FragColor.rgb += uFresnelColor * fresnel * 0.15;`
    );
  };
}

/**
 * Call this in useFrame to update breathing animation time.
 */
export function updateBreathingTime(material: THREE.MeshStandardMaterial, time: number) {
  const shader = (material as any)._shaderRef;
  if (shader?.uniforms?.uTime) {
    shader.uniforms.uTime.value = time;
  }
}
