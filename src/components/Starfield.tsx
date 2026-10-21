"use client";
import { useEffect, useRef } from "react";

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const context = canvas.getContext("2d"); if (!context) return;
    const starColor = getComputedStyle(canvas).getPropertyValue("--text-inverse").trim();
    let frame = 0; let animation = 0; let active = true;
    const stars = Array.from({ length: 90 }, (_, index) => ({ x: (index * 83) % 1000, y: (index * 47) % 600, size: index % 3 + 1 }));
    const draw = () => {
      if (!active) return;
      canvas.width = canvas.clientWidth * devicePixelRatio; canvas.height = canvas.clientHeight * devicePixelRatio;
      context.clearRect(0, 0, canvas.width, canvas.height); context.fillStyle = starColor;
      stars.forEach((star) => { context.globalAlpha = .2 + ((star.x + frame) % 80) / 100; context.fillRect(star.x / 1000 * canvas.width, star.y / 600 * canvas.height, star.size, star.size); });
      if (!document.documentElement.classList.contains("reduce-motion")) frame++;
      animation = requestAnimationFrame(draw);
    };
    animation = requestAnimationFrame(draw);
    return () => { active = false; cancelAnimationFrame(animation); };
  }, []);
  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
