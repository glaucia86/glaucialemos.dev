"use client";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { observeMotionActivity } from "@/lib/motion";

// Cobe expects normalized RGB; resolve the same CSS tokens used by the UI.
function globeColor(styles: CSSStyleDeclaration, token: string): [number, number, number] {
  const hex = styles.getPropertyValue(token).trim();
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255) as [number, number, number];
}

export default function EventGlobe({ markers }: { markers: { location: [number, number]; size: number }[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    let phi = 0;
    let frame = 0;
    let active = false;
    const styles = getComputedStyle(canvas.current);
    const globe = createGlobe(canvas.current, {
      devicePixelRatio: 2, width: 700, height: 700, phi: 0, theta: .25,
      dark: 1, diffuse: 1.3, mapSamples: 12000, mapBrightness: 5,
      baseColor: globeColor(styles, "--color-primary-950"),
      markerColor: globeColor(styles, "--color-accent"),
      glowColor: globeColor(styles, "--color-primary"),
      markers,
    });
    const rotate = () => {
      if (!active) return;
      phi += .0025;
      globe.update({ phi });
      frame = requestAnimationFrame(rotate);
    };
    const stopObserving = observeMotionActivity(canvas.current, (next) => {
      if (active === next) return;
      active = next;
      if (active) frame = requestAnimationFrame(rotate);
      else cancelAnimationFrame(frame);
    });
    return () => { stopObserving(); cancelAnimationFrame(frame); globe.destroy(); };
  }, [markers]);

  return <canvas ref={canvas} className="globe" aria-hidden="true" />;
}
