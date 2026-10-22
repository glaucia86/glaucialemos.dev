"use client";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "./MotionPreference";

// Cobe expects normalized RGB; resolve the same CSS tokens used by the UI.
function globeColor(styles: CSSStyleDeclaration, token: string): [number, number, number] {
  const hex = styles.getPropertyValue(token).trim();
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255) as [number, number, number];
}

export default function EventGlobe({ markers }: { markers: { location: [number, number]; size: number }[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!canvas.current) return;
    let phi = 4.6;
    let frame = 0;
    const styles = getComputedStyle(canvas.current);
    const globe = createGlobe(canvas.current, {
      devicePixelRatio: 2, width: 700, height: 700, phi, theta: .15,
      dark: 0, diffuse: 1.5, mapSamples: 16000, mapBrightness: 6,
      baseColor: globeColor(styles, "--color-primary-300"),
      markerColor: globeColor(styles, "--color-accent"),
      glowColor: globeColor(styles, "--color-primary-100"),
      markers,
    });
    const rotate = () => {
      if (!document.hidden) {
        phi += .0025;
        globe.update({ phi });
      }
      frame = requestAnimationFrame(rotate);
    };
    if (!reduced) frame = requestAnimationFrame(rotate);
    return () => { cancelAnimationFrame(frame); globe.destroy(); };
  }, [markers, reduced]);

  return <canvas ref={canvas} className="globe" aria-hidden="true" />;
}
