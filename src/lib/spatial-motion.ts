export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));
}

// Exponential smoothing is independent of the display's refresh rate.
export function smooth(current: number, target: number, elapsedMs: number, responseMs = 180) {
  return current + (target - current) * (1 - Math.exp(-Math.max(0, elapsedMs) / responseMs));
}

export type CameraMotion = { kind: "push" | "pan"; duration: number; direction: 1 | -1 };

// One leg takes 7–10 seconds, then reverses with a sine ease at each end.
export function cameraMotion(elapsed: number, camera: CameraMotion) {
  const progress = (1 - Math.cos(elapsed / camera.duration * Math.PI)) / 2;
  return {
    scale: 1.035 + (camera.kind === "push" ? progress * .035 : 0),
    pan: camera.kind === "pan" ? (progress * 2 - 1) * 12 * camera.direction : 0,
    foregroundScale: 1.025 + progress * (camera.kind === "push" ? .12 : .035),
  };
}

export type StoryClock = { until: number; next: number };

// Uses visible animation time, so a hidden tab cannot consume an entrance beat.
export function advanceStory(clock: StoryClock, elapsed: number, duration: number, requested = false, random = Math.random): StoryClock {
  if (elapsed < clock.until || (!requested && elapsed < clock.next)) return clock;
  return { until: elapsed + duration, next: elapsed + 12000 + clamp(random(), 0, 1) * 8000 };
}

export type OrientationPermission = "prompt" | "pending" | "granted" | "denied";

export function showOrientationPermission({ mobile, supported, requiresPermission, reduced, dismissed, permission }: {
  mobile: boolean;
  supported: boolean;
  requiresPermission: boolean;
  reduced: boolean;
  dismissed: boolean;
  permission: OrientationPermission;
}) {
  return mobile && supported && requiresPermission && !reduced && !dismissed && permission === "prompt";
}
