"use client";

import createGlobe, { type Globe } from "cobe";
import { useEffect, useRef } from "react";
import { observeMotion } from "@/lib/motion";

function globeColor(styles: CSSStyleDeclaration, token: string): [number, number, number] {
  const hex = styles.getPropertyValue(token).trim();
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255) as [number, number, number];
}

export default function EventGlobe({ markers }: { markers: { location: [number, number]; size: number }[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    let globe: Globe | undefined;
    let phi = .4;
    let frame = 0;
    let previous = 0;
    let unavailable = false;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const size = () => Math.round(node.clientWidth);
    const initialize = () => {
      if (globe || unavailable) return;
      // COBE returns a no-op when WebGL is unavailable; keep the CSS fallback.
      if (!node.getContext("webgl2") && !node.getContext("webgl")) {
        unavailable = true;
        return;
      }
      const styles = getComputedStyle(node);
      globe = createGlobe(node, {
        devicePixelRatio: pixelRatio, width: size(), height: size(), phi, theta: .25,
        dark: 1, diffuse: 1.3, mapSamples: 12000, mapBrightness: 5, mapBaseBrightness: .05,
        baseColor: globeColor(styles, "--color-primary-300"),
        markerColor: globeColor(styles, "--color-accent"),
        glowColor: globeColor(styles, "--color-primary"),
        markers,
      });
      node.dataset.ready = "true";
    };
    const rotate = (now: number) => {
      if (previous) phi += Math.min(now - previous, 64) * .00015;
      previous = now;
      globe?.update({ phi });
      frame = requestAnimationFrame(rotate);
    };
    const disconnect = observeMotion(node, ({ active, reduced }) => {
      node.dataset.reduced = String(reduced);
      cancelAnimationFrame(frame);
      previous = 0;
      if (active) initialize();
      if (active && globe) frame = requestAnimationFrame(rotate);
    });
    const resize = new ResizeObserver(() => globe?.update({ width: size(), height: size() }));
    resize.observe(node);
    return () => {
      disconnect();
      resize.disconnect();
      cancelAnimationFrame(frame);
      globe?.destroy();
      delete node.dataset.ready;
      delete node.dataset.reduced;
    };
  }, [markers]);

  return <canvas ref={canvas} className="globe" aria-hidden="true" />;
}
