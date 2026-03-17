/**
 * Performance tier detection for gating heavy effects.
 * high   = full post-processing, GPU particles, shaders
 * medium = reduced post-processing, fewer particles
 * low    = minimal effects (bloom + vignette only)
 */

export type DeviceTier = "high" | "medium" | "low";

let _cachedTier: DeviceTier | null = null;

export function getDeviceTier(): DeviceTier {
  if (_cachedTier) return _cachedTier;
  if (typeof window === "undefined") return "medium";

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency || 4;

  // Try to get GPU info
  let gpuTier: "high" | "medium" | "low" = "medium";
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL).toLowerCase();
        // High-end GPUs
        if (
          renderer.includes("apple m") ||
          renderer.includes("nvidia") ||
          renderer.includes("radeon pro") ||
          renderer.includes("rtx")
        ) {
          gpuTier = "high";
        }
        // Low-end / integrated
        else if (
          renderer.includes("intel") ||
          renderer.includes("mali-g5") ||
          renderer.includes("adreno 6")
        ) {
          gpuTier = "low";
        }
      }
    }
    canvas.remove();
  } catch {
    // WebGL detection failed, stick with medium
  }

  // Compute final tier
  if (isMobile) {
    // Mobile: cap at medium unless very high-end
    _cachedTier = gpuTier === "high" && cores >= 6 ? "medium" : "low";
  } else {
    if (gpuTier === "high" && cores >= 8) _cachedTier = "high";
    else if (gpuTier === "low" || cores <= 4) _cachedTier = "low";
    else _cachedTier = "medium";
  }

  return _cachedTier;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
